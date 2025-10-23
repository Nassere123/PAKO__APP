import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOptimizedSchema1700000000001 implements MigrationInterface {
  name = 'CreateOptimizedSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer les extensions PostgreSQL nécessaires
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    // Créer la table users avec optimisations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "email" character varying(255),
        "password" character varying(255) NOT NULL,
        "userType" character varying(20) NOT NULL DEFAULT 'customer',
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "verificationCode" character varying(6),
        "verificationCodeExpires" TIMESTAMP,
        "isVerified" boolean NOT NULL DEFAULT false,
        "profilePhoto" character varying(500),
        "address" text,
        "city" character varying(100),
        "country" character varying(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Créer la table drivers avec optimisations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "drivers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "licenseNumber" character varying(50) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'offline',
        "vehicleType" character varying(20) NOT NULL,
        "vehicleBrand" character varying(100) NOT NULL,
        "vehicleModel" character varying(100) NOT NULL,
        "plateNumber" character varying(20) NOT NULL,
        "vehicleColor" character varying(50) NOT NULL,
        "maxLoadCapacity" decimal(10,2) NOT NULL,
        "currentLatitude" decimal(10,8),
        "currentLongitude" decimal(11,8),
        "rating" decimal(3,2) NOT NULL DEFAULT 0,
        "totalRatings" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_drivers_id" PRIMARY KEY ("id")
      )
    `);

    // Créer la table orders avec optimisations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderNumber" character varying(20) NOT NULL,
        "customerId" uuid NOT NULL,
        "driverId" uuid,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "paymentStatus" character varying(20) NOT NULL DEFAULT 'pending',
        "totalPrice" decimal(10,2) NOT NULL,
        "basePrice" decimal(10,2) NOT NULL,
        "distanceFee" decimal(10,2) NOT NULL DEFAULT 0,
        "weightFee" decimal(10,2) NOT NULL DEFAULT 0,
        "additionalFees" decimal(10,2) NOT NULL DEFAULT 0,
        "distance" decimal(10,2) NOT NULL,
        "totalWeight" decimal(10,2) NOT NULL,
        "pickupAddress" text NOT NULL,
        "pickupLatitude" decimal(10,8) NOT NULL,
        "pickupLongitude" decimal(11,8) NOT NULL,
        "deliveryAddress" text NOT NULL,
        "deliveryLatitude" decimal(10,8) NOT NULL,
        "deliveryLongitude" decimal(11,8) NOT NULL,
        "specialInstructions" text,
        "scheduledPickupTime" TIMESTAMP NOT NULL,
        "scheduledDeliveryTime" TIMESTAMP NOT NULL,
        "actualPickupTime" TIMESTAMP,
        "actualDeliveryTime" TIMESTAMP,
        "rating" decimal(3,2),
        "comment" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )
    `);

    // Créer la table packages avec optimisations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "packages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "type" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "weight" decimal(10,2) NOT NULL,
        "length" decimal(10,2) NOT NULL,
        "width" decimal(10,2) NOT NULL,
        "height" decimal(10,2) NOT NULL,
        "declaredValue" decimal(10,2) NOT NULL DEFAULT 0,
        "isFragile" boolean NOT NULL DEFAULT false,
        "requiresSignature" boolean NOT NULL DEFAULT false,
        "specialInstructions" text,
        "photo" character varying(500),
        "trackingCode" character varying(20) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_packages_id" PRIMARY KEY ("id")
      )
    `);

    // Créer la table stations avec optimisations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "type" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "address" text NOT NULL,
        "latitude" decimal(10,8) NOT NULL,
        "longitude" decimal(11,8) NOT NULL,
        "city" character varying(100) NOT NULL,
        "country" character varying(100) NOT NULL,
        "postalCode" character varying(20),
        "phone" character varying(20),
        "email" character varying(255),
        "openingHours" jsonb,
        "storageCapacity" integer,
        "currentCapacity" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_stations_id" PRIMARY KEY ("id")
      )
    `);

    // Créer les index pour optimiser les performances
    await this.createIndexes(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les tables dans l'ordre inverse
    await queryRunner.query(`DROP TABLE IF EXISTS "stations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "packages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // Index pour la table users
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_phone" ON "users" ("phone") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email") WHERE "email" IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_users_userType" ON "users" ("userType")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_createdAt" ON "users" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_city" ON "users" ("city") WHERE "city" IS NOT NULL`);

    // Index pour la table drivers
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_drivers_userId" ON "drivers" ("userId") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_drivers_licenseNumber" ON "drivers" ("licenseNumber") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_drivers_plateNumber" ON "drivers" ("plateNumber") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_status" ON "drivers" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_vehicleType" ON "drivers" ("vehicleType")`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_isActive" ON "drivers" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_rating" ON "drivers" ("rating")`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_location" ON "drivers" ("currentLatitude", "currentLongitude") WHERE "currentLatitude" IS NOT NULL AND "currentLongitude" IS NOT NULL`);

    // Index pour la table orders
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_orders_orderNumber" ON "orders" ("orderNumber") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_customerId" ON "orders" ("customerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_driverId" ON "orders" ("driverId") WHERE "driverId" IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_paymentStatus" ON "orders" ("paymentStatus")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_createdAt" ON "orders" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_scheduledPickupTime" ON "orders" ("scheduledPickupTime")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_scheduledDeliveryTime" ON "orders" ("scheduledDeliveryTime")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_pickup_location" ON "orders" ("pickupLatitude", "pickupLongitude")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_delivery_location" ON "orders" ("deliveryLatitude", "deliveryLongitude")`);

    // Index pour la table packages
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_packages_trackingCode" ON "packages" ("trackingCode") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_packages_orderId" ON "packages" ("orderId")`);
    await queryRunner.query(`CREATE INDEX "IDX_packages_type" ON "packages" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_packages_status" ON "packages" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_packages_createdAt" ON "packages" ("createdAt")`);

    // Index pour la table stations
    await queryRunner.query(`CREATE INDEX "IDX_stations_type" ON "stations" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_stations_status" ON "stations" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_stations_city" ON "stations" ("city")`);
    await queryRunner.query(`CREATE INDEX "IDX_stations_country" ON "stations" ("country")`);
    await queryRunner.query(`CREATE INDEX "IDX_stations_isActive" ON "stations" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_stations_location" ON "stations" ("latitude", "longitude")`);

    // Index composites pour les requêtes complexes
    await queryRunner.query(`CREATE INDEX "IDX_orders_customer_status" ON "orders" ("customerId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_driver_status" ON "orders" ("driverId", "status") WHERE "driverId" IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_drivers_status_active" ON "drivers" ("status", "isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_type_status" ON "users" ("userType", "status")`);

    // Index pour les recherches textuelles (trigram)
    await queryRunner.query(`CREATE INDEX "IDX_users_name_trgm" ON "users" USING gin (("firstName" || ' ' || "lastName") gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_address_trgm" ON "orders" USING gin ("pickupAddress" gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_delivery_address_trgm" ON "orders" USING gin ("deliveryAddress" gin_trgm_ops)`);
  }
}
