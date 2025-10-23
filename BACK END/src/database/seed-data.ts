import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function seedDatabase() {
  console.log('🌱 Ajout de données de test dans la base PAKO...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs de test...');
    
    const users = [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+2250701234567',
        email: 'jean.dupont@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        userType: 'customer',
        status: 'active',
        isVerified: true,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      },
      {
        firstName: 'Marie',
        lastName: 'Koné',
        phone: '+2250701234568',
        email: 'marie.kone@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        userType: 'customer',
        status: 'active',
        isVerified: true,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      },
      {
        firstName: 'Kouassi',
        lastName: 'Traoré',
        phone: '+2250701234569',
        email: 'kouassi.traore@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        userType: 'driver',
        status: 'active',
        isVerified: true,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      },
      {
        firstName: 'Admin',
        lastName: 'PAKO',
        phone: '+2250701234570',
        email: 'admin@pako.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        userType: 'admin',
        status: 'active',
        isVerified: true,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      }
    ];
    
    const userIds = [];
    for (const user of users) {
      const result = await connectionPoolService.query(`
        INSERT INTO users ("firstName", "lastName", phone, email, password, "userType", status, "isVerified", city, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [user.firstName, user.lastName, user.phone, user.email, user.password, user.userType, user.status, user.isVerified, user.city, user.country]);
      
      userIds.push(result.rows[0].id);
      console.log(`   ✅ Utilisateur ${user.firstName} ${user.lastName} créé`);
    }
    
    // Créer un chauffeur
    console.log('🚗 Création du chauffeur de test...');
    const driverResult = await connectionPoolService.query(`
      INSERT INTO drivers ("userId", "licenseNumber", status, "vehicleType", "vehicleBrand", "vehicleModel", "plateNumber", "vehicleColor", "maxLoadCapacity", "currentLatitude", "currentLongitude")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      userIds[2], // Kouassi Traoré
      'LIC123456',
      'available',
      'motorcycle',
      'Honda',
      'CG 125',
      'AB-123-CD',
      'Rouge',
      50.0,
      5.3167, // Latitude Abidjan
      -4.0333  // Longitude Abidjan
    ]);
    const driverId = driverResult.rows[0].id;
    console.log('   ✅ Chauffeur créé');
    
    // Créer des stations
    console.log('🏢 Création des stations de test...');
    const stations = [
      {
        name: 'Station Centre Ville',
        type: 'hub',
        address: 'Plateau, Abidjan',
        latitude: 5.3167,
        longitude: -4.0333,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        phone: '+22520203040',
        email: 'centre@pako.com',
        storageCapacity: 1000,
        currentCapacity: 0
      },
      {
        name: 'Station Cocody',
        type: 'pickup',
        address: 'Cocody, Abidjan',
        latitude: 5.3500,
        longitude: -4.0000,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        phone: '+22520203041',
        email: 'cocody@pako.com',
        storageCapacity: 500,
        currentCapacity: 0
      },
      {
        name: 'Station Marcory',
        type: 'delivery',
        address: 'Marcory, Abidjan',
        latitude: 5.2800,
        longitude: -4.0500,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        phone: '+22520203042',
        email: 'marcory@pako.com',
        storageCapacity: 800,
        currentCapacity: 0
      }
    ];
    
    const stationIds = [];
    for (const station of stations) {
      const result = await connectionPoolService.query(`
        INSERT INTO stations (name, type, address, latitude, longitude, city, country, phone, email, "storageCapacity", "currentCapacity")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [station.name, station.type, station.address, station.latitude, station.longitude, station.city, station.country, station.phone, station.email, station.storageCapacity, station.currentCapacity]);
      
      stationIds.push(result.rows[0].id);
      console.log(`   ✅ Station ${station.name} créée`);
    }
    
    // Créer des commandes de test
    console.log('📦 Création des commandes de test...');
    const orders = [
      {
        orderNumber: 'PAKO-001',
        customerId: userIds[0], // Jean Dupont
        driverId: driverId,
        status: 'delivered',
        paymentStatus: 'paid',
        totalPrice: 2500.0,
        basePrice: 1000.0,
        distanceFee: 1000.0,
        weightFee: 500.0,
        distance: 5.2,
        totalWeight: 2.5,
        pickupAddress: 'Plateau, Abidjan',
        pickupLatitude: 5.3167,
        pickupLongitude: -4.0333,
        deliveryAddress: 'Cocody, Abidjan',
        deliveryLatitude: 5.3500,
        deliveryLongitude: -4.0000,
        scheduledPickupTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours ago
        scheduledDeliveryTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 heures après
        actualPickupTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 min après
        actualDeliveryTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 10 * 60 * 1000), // 10 min après
        rating: 4.5,
        comment: 'Livraison rapide et efficace'
      },
      {
        orderNumber: 'PAKO-002',
        customerId: userIds[1], // Marie Koné
        driverId: null,
        status: 'pending',
        paymentStatus: 'pending',
        totalPrice: 1800.0,
        basePrice: 1000.0,
        distanceFee: 600.0,
        weightFee: 200.0,
        distance: 3.8,
        totalWeight: 1.2,
        pickupAddress: 'Marcory, Abidjan',
        pickupLatitude: 5.2800,
        pickupLongitude: -4.0500,
        deliveryAddress: 'Plateau, Abidjan',
        deliveryLatitude: 5.3167,
        deliveryLongitude: -4.0333,
        scheduledPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2 heures
        scheduledDeliveryTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // Dans 4 heures
        actualPickupTime: null,
        actualDeliveryTime: null,
        rating: null,
        comment: null
      }
    ];
    
    const orderIds = [];
    for (const order of orders) {
      const result = await connectionPoolService.query(`
        INSERT INTO orders ("orderNumber", "customerId", "driverId", status, "paymentStatus", "totalPrice", "basePrice", "distanceFee", "weightFee", distance, "totalWeight", "pickupAddress", "pickupLatitude", "pickupLongitude", "deliveryAddress", "deliveryLatitude", "deliveryLongitude", "scheduledPickupTime", "scheduledDeliveryTime", "actualPickupTime", "actualDeliveryTime", rating, comment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING id
      `, [
        order.orderNumber, order.customerId, order.driverId, order.status, order.paymentStatus,
        order.totalPrice, order.basePrice, order.distanceFee, order.weightFee, order.distance, order.totalWeight,
        order.pickupAddress, order.pickupLatitude, order.pickupLongitude, order.deliveryAddress, order.deliveryLatitude, order.deliveryLongitude,
        order.scheduledPickupTime, order.scheduledDeliveryTime, order.actualPickupTime, order.actualDeliveryTime, order.rating, order.comment
      ]);
      
      orderIds.push(result.rows[0].id);
      console.log(`   ✅ Commande ${order.orderNumber} créée`);
    }
    
    // Créer des colis de test
    console.log('📦 Création des colis de test...');
    const packages = [
      {
        orderId: orderIds[0],
        name: 'Documents importants',
        description: 'Contrat de travail',
        type: 'document',
        status: 'delivered',
        weight: 0.5,
        length: 30.0,
        width: 21.0,
        height: 2.0,
        declaredValue: 50000.0,
        isFragile: false,
        requiresSignature: true,
        trackingCode: 'TRK001'
      },
      {
        orderId: orderIds[0],
        name: 'Cadeau',
        description: 'Livre',
        type: 'parcel',
        status: 'delivered',
        weight: 0.8,
        length: 25.0,
        width: 18.0,
        height: 3.0,
        declaredValue: 15000.0,
        isFragile: false,
        requiresSignature: false,
        trackingCode: 'TRK002'
      },
      {
        orderId: orderIds[1],
        name: 'Vêtements',
        description: 'Chemise et pantalon',
        type: 'clothing',
        status: 'pending',
        weight: 1.2,
        length: 40.0,
        width: 30.0,
        height: 5.0,
        declaredValue: 25000.0,
        isFragile: false,
        requiresSignature: false,
        trackingCode: 'TRK003'
      }
    ];
    
    for (const pkg of packages) {
      await connectionPoolService.query(`
        INSERT INTO packages ("orderId", name, description, type, status, weight, length, width, height, "declaredValue", "isFragile", "requiresSignature", "trackingCode")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [pkg.orderId, pkg.name, pkg.description, pkg.type, pkg.status, pkg.weight, pkg.length, pkg.width, pkg.height, pkg.declaredValue, pkg.isFragile, pkg.requiresSignature, pkg.trackingCode]);
      
      console.log(`   ✅ Colis ${pkg.trackingCode} créé`);
    }
    
    console.log('\n🎉 Données de test ajoutées avec succès !');
    console.log('✅ Base de données PAKO prête avec des données de test');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error);
    process.exit(1);
  }
}

// Exécuter le seeding si ce fichier est appelé directement
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
