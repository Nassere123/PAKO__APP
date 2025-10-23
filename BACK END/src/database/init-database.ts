import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function initializeDatabase() {
  console.log('🚀 Initialisation de la base de données PAKO...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // Créer les extensions PostgreSQL
    console.log('📦 Installation des extensions PostgreSQL...');
    await connectionPoolService.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await connectionPoolService.query('CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"');
    await connectionPoolService.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    console.log('   ✅ Extensions installées');
    
    // Créer les tables
    console.log('🗄️ Création des tables...');
    
    // Table users
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        "userType" VARCHAR(20) NOT NULL DEFAULT 'customer',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        "verificationCode" VARCHAR(6),
        "verificationCodeExpires" TIMESTAMP,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "profilePhoto" VARCHAR(500),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Table users créée');
    
    // Table drivers
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        "licenseNumber" VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'offline',
        "vehicleType" VARCHAR(20) NOT NULL,
        "vehicleBrand" VARCHAR(100) NOT NULL,
        "vehicleModel" VARCHAR(100) NOT NULL,
        "plateNumber" VARCHAR(20) UNIQUE NOT NULL,
        "vehicleColor" VARCHAR(50) NOT NULL,
        "maxLoadCapacity" DECIMAL(10,2) NOT NULL,
        "currentLatitude" DECIMAL(10,8),
        "currentLongitude" DECIMAL(11,8),
        rating DECIMAL(3,2) NOT NULL DEFAULT 0,
        "totalRatings" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Table drivers créée');
    
    // Table orders
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderNumber" VARCHAR(20) UNIQUE NOT NULL,
        "customerId" UUID NOT NULL REFERENCES users(id),
        "driverId" UUID REFERENCES drivers(id),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        "paymentStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "totalPrice" DECIMAL(10,2) NOT NULL,
        "basePrice" DECIMAL(10,2) NOT NULL,
        "distanceFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "weightFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "additionalFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
        distance DECIMAL(10,2) NOT NULL,
        "totalWeight" DECIMAL(10,2) NOT NULL,
        "pickupAddress" TEXT NOT NULL,
        "pickupLatitude" DECIMAL(10,8) NOT NULL,
        "pickupLongitude" DECIMAL(11,8) NOT NULL,
        "deliveryAddress" TEXT NOT NULL,
        "deliveryLatitude" DECIMAL(10,8) NOT NULL,
        "deliveryLongitude" DECIMAL(11,8) NOT NULL,
        "specialInstructions" TEXT,
        "scheduledPickupTime" TIMESTAMP NOT NULL,
        "scheduledDeliveryTime" TIMESTAMP NOT NULL,
        "actualPickupTime" TIMESTAMP,
        "actualDeliveryTime" TIMESTAMP,
        rating DECIMAL(3,2),
        comment TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Table orders créée');
    
    // Table packages
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" UUID NOT NULL REFERENCES orders(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        weight DECIMAL(10,2) NOT NULL,
        length DECIMAL(10,2) NOT NULL,
        width DECIMAL(10,2) NOT NULL,
        height DECIMAL(10,2) NOT NULL,
        "declaredValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "isFragile" BOOLEAN NOT NULL DEFAULT false,
        "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
        "specialInstructions" TEXT,
        photo VARCHAR(500),
        "trackingCode" VARCHAR(20) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Table packages créée');
    
    // Table stations
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        address TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        "postalCode" VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(255),
        "openingHours" JSONB,
        "storageCapacity" INTEGER,
        "currentCapacity" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Table stations créée');
    
    // Créer les index
    console.log('📊 Création des index...');
    await createIndexes(connectionPoolService);
    
    console.log('\n🎉 Base de données PAKO initialisée avec succès !');
    console.log('✅ Toutes les tables et index ont été créés');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

async function createIndexes(connectionPoolService: ConnectionPoolService) {
  const indexes = [
    // Index pour users
    'CREATE INDEX IF NOT EXISTS "IDX_users_phone" ON users (phone) WHERE "deletedAt" IS NULL',
    'CREATE INDEX IF NOT EXISTS "IDX_users_email" ON users (email) WHERE email IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS "IDX_users_userType" ON users ("userType")',
    'CREATE INDEX IF NOT EXISTS "IDX_users_status" ON users (status)',
    
    // Index pour drivers
    'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_userId" ON drivers ("userId") WHERE "deletedAt" IS NULL',
    'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_licenseNumber" ON drivers ("licenseNumber") WHERE "deletedAt" IS NULL',
    'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_plateNumber" ON drivers ("plateNumber") WHERE "deletedAt" IS NULL',
    'CREATE INDEX IF NOT EXISTS "IDX_drivers_status" ON drivers (status)',
    'CREATE INDEX IF NOT EXISTS "IDX_drivers_available" ON drivers (status, "isActive") WHERE status = \'available\' AND "isActive" = true',
    
    // Index pour orders
    'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_orders_orderNumber" ON orders ("orderNumber") WHERE "deletedAt" IS NULL',
    'CREATE INDEX IF NOT EXISTS "IDX_orders_customerId" ON orders ("customerId")',
    'CREATE INDEX IF NOT EXISTS "IDX_orders_driverId" ON orders ("driverId") WHERE "driverId" IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON orders (status)',
    'CREATE INDEX IF NOT EXISTS "IDX_orders_createdAt" ON orders ("createdAt")',
    
    // Index pour packages
    'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_packages_trackingCode" ON packages ("trackingCode") WHERE "deletedAt" IS NULL',
    'CREATE INDEX IF NOT EXISTS "IDX_packages_orderId" ON packages ("orderId")',
    'CREATE INDEX IF NOT EXISTS "IDX_packages_type" ON packages (type)',
    'CREATE INDEX IF NOT EXISTS "IDX_packages_status" ON packages (status)',
    
    // Index pour stations
    'CREATE INDEX IF NOT EXISTS "IDX_stations_type" ON stations (type)',
    'CREATE INDEX IF NOT EXISTS "IDX_stations_status" ON stations (status)',
    'CREATE INDEX IF NOT EXISTS "IDX_stations_city" ON stations (city)',
    'CREATE INDEX IF NOT EXISTS "IDX_stations_isActive" ON stations ("isActive")',
  ];
  
  for (const indexQuery of indexes) {
    await connectionPoolService.query(indexQuery);
  }
  console.log('   ✅ Tous les index créés');
}

// Exécuter l'initialisation si ce fichier est appelé directement
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
