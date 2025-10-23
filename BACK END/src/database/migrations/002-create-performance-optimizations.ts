import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePerformanceOptimizations1700000000002 implements MigrationInterface {
  name = 'CreatePerformanceOptimizations1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer des vues matérialisées pour les statistiques fréquentes
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_order_stats" AS
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN "status" = 'delivered' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN "status" = 'cancelled' THEN 1 END) as cancelled_orders,
        AVG("totalPrice") as avg_price,
        SUM("totalPrice") as total_revenue
      FROM "orders"
      WHERE "deletedAt" IS NULL
      GROUP BY DATE_TRUNC('day', "createdAt")
    `);

    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_driver_performance" AS
      SELECT 
        d."id",
        d."userId",
        u."firstName",
        u."lastName",
        d."rating",
        d."totalRatings",
        COUNT(o."id") as total_orders,
        COUNT(CASE WHEN o."status" = 'delivered' THEN 1 END) as completed_orders,
        AVG(CASE WHEN o."status" = 'delivered' THEN o."totalPrice" END) as avg_order_value
      FROM "drivers" d
      LEFT JOIN "users" u ON d."userId" = u."id"
      LEFT JOIN "orders" o ON d."id" = o."driverId"
      WHERE d."deletedAt" IS NULL AND u."deletedAt" IS NULL
      GROUP BY d."id", d."userId", u."firstName", u."lastName", d."rating", d."totalRatings"
    `);

    // Créer des index partiels pour les requêtes fréquentes
    await queryRunner.query(`CREATE INDEX "IDX_orders_active" ON "orders" ("status", "createdAt") WHERE "status" IN ('pending', 'confirmed', 'picked_up', 'in_transit') AND "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_recent" ON "orders" ("createdAt" DESC) WHERE "createdAt" > NOW() - INTERVAL '30 days' AND "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_available" ON "drivers" ("status", "isActive") WHERE "status" = 'available' AND "isActive" = true AND "deletedAt" IS NULL`);

    // Créer des fonctions PostgreSQL pour les calculs complexes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_distance(
        lat1 DECIMAL, lon1 DECIMAL,
        lat2 DECIMAL, lon2 DECIMAL
      ) RETURNS DECIMAL AS $$
      BEGIN
        RETURN 6371 * acos(
          cos(radians(lat1)) * cos(radians(lat2)) * 
          cos(radians(lon2) - radians(lon1)) + 
          sin(radians(lat1)) * sin(radians(lat2))
        );
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION find_nearby_drivers(
        p_lat DECIMAL,
        p_lon DECIMAL,
        p_radius DECIMAL DEFAULT 10
      ) RETURNS TABLE (
        driver_id UUID,
        distance DECIMAL,
        rating DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          d."id" as driver_id,
          calculate_distance(p_lat, p_lon, d."currentLatitude", d."currentLongitude") as distance,
          d."rating"
        FROM "drivers" d
        WHERE d."status" = 'available' 
          AND d."isActive" = true
          AND d."currentLatitude" IS NOT NULL
          AND d."currentLongitude" IS NOT NULL
          AND d."deletedAt" IS NULL
          AND calculate_distance(p_lat, p_lon, d."currentLatitude", d."currentLongitude") <= p_radius
        ORDER BY distance, d."rating" DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_driver_rating(
        p_driver_id UUID,
        p_new_rating DECIMAL
      ) RETURNS VOID AS $$
      DECLARE
        current_rating DECIMAL;
        current_count INTEGER;
        new_rating DECIMAL;
        new_count INTEGER;
      BEGIN
        SELECT "rating", "totalRatings" 
        INTO current_rating, current_count
        FROM "drivers" 
        WHERE "id" = p_driver_id;
        
        new_count := current_count + 1;
        new_rating := ((current_rating * current_count) + p_new_rating) / new_count;
        
        UPDATE "drivers" 
        SET 
          "rating" = new_rating,
          "totalRatings" = new_count,
          "updatedAt" = NOW()
        WHERE "id" = p_driver_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Créer des triggers pour maintenir les statistiques
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_order_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Rafraîchir la vue matérialisée quand une commande change
        REFRESH MATERIALIZED VIEW "mv_order_stats";
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_update_order_stats
      AFTER INSERT OR UPDATE OR DELETE ON "orders"
      FOR EACH STATEMENT
      EXECUTE FUNCTION update_order_stats();
    `);

    // Créer des contraintes de validation
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_phone_format" CHECK ("phone" ~ '^[+]?[0-9]{8,15}$')`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_email_format" CHECK ("email" IS NULL OR "email" ~ '^[^@]+@[^@]+\.[^@]+$')`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_userType" CHECK ("userType" IN ('customer', 'driver', 'admin'))`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_status" CHECK ("status" IN ('active', 'inactive', 'suspended'))`);

    await queryRunner.query(`ALTER TABLE "drivers" ADD CONSTRAINT "CHK_drivers_status" CHECK ("status" IN ('available', 'busy', 'offline'))`);
    await queryRunner.query(`ALTER TABLE "drivers" ADD CONSTRAINT "CHK_drivers_vehicleType" CHECK ("vehicleType" IN ('motorcycle', 'car', 'van', 'truck'))`);
    await queryRunner.query(`ALTER TABLE "drivers" ADD CONSTRAINT "CHK_drivers_rating" CHECK ("rating" >= 0 AND "rating" <= 5)`);

    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_status" CHECK ("status" IN ('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'))`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_paymentStatus" CHECK ("paymentStatus" IN ('pending', 'paid', 'failed', 'refunded'))`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_rating" CHECK ("rating" IS NULL OR ("rating" >= 0 AND "rating" <= 5))`);

    await queryRunner.query(`ALTER TABLE "packages" ADD CONSTRAINT "CHK_packages_type" CHECK ("type" IN ('document', 'parcel', 'food', 'medicine', 'electronics', 'clothing', 'other'))`);
    await queryRunner.query(`ALTER TABLE "packages" ADD CONSTRAINT "CHK_packages_status" CHECK ("status" IN ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'))`);

    await queryRunner.query(`ALTER TABLE "stations" ADD CONSTRAINT "CHK_stations_type" CHECK ("type" IN ('pickup', 'delivery', 'hub'))`);
    await queryRunner.query(`ALTER TABLE "stations" ADD CONSTRAINT "CHK_stations_status" CHECK ("status" IN ('active', 'inactive', 'maintenance'))`);

    // Créer des index pour les vues matérialisées
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_mv_order_stats_date" ON "mv_order_stats" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_mv_driver_performance_rating" ON "mv_driver_performance" ("rating" DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS "trigger_update_order_stats" ON "orders"`);
    
    // Supprimer les fonctions
    await queryRunner.query(`DROP FUNCTION IF EXISTS "update_order_stats"()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS "update_driver_rating"(UUID, DECIMAL)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS "find_nearby_drivers"(DECIMAL, DECIMAL, DECIMAL)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS "calculate_distance"(DECIMAL, DECIMAL, DECIMAL, DECIMAL)`);
    
    // Supprimer les vues matérialisées
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "mv_driver_performance"`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "mv_order_stats"`);
    
    // Supprimer les index partiels
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_drivers_available"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_recent"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_active"`);
  }
}
