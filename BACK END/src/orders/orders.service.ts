import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Package } from '../packages/entities/package.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'packages'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'packages'],
    });
    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} non trouvée`);
    }
    return order;
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { customerId },
      relations: ['customer', 'packages'],
    });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.ordersRepository.create(orderData);
    return this.ordersRepository.save(order);
  }

  async startOrderProcess(customerId: string, customerName?: string): Promise<{ message: string; timestamp: string }> {
    console.log('\n🎯 ===== DÉBUT DU PROCESSUS DE COMMANDE =====');
    console.log('👤 Utilisateur connecté:');
    console.log(`   🆔 ID: ${customerId}`);
    console.log(`   👤 Nom: ${customerName || 'Non spécifié'}`);
    console.log(`   📞 Téléphone: En attente des données du formulaire`);
    console.log('📝 L\'utilisateur va maintenant remplir le formulaire de commande...');
    console.log('⏳ En attente des données de la commande...');
    console.log('===============================================\n');

    return {
      message: 'Processus de commande démarré',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   * @param lat1 Latitude du premier point
   * @param lon1 Longitude du premier point
   * @param lat2 Latitude du deuxième point
   * @param lon2 Longitude du deuxième point
   * @returns Distance en kilomètres
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en kilomètres
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  }

  async createOrderWithPackages(createOrderDto: CreateOrderDto): Promise<Order> {
    console.log('\n🚀 ===== NOUVELLE COMMANDE REÇUE =====');
    console.log('📋 Données de la commande:');
    console.log(`   👤 Client ID: ${createOrderDto.customerId}`);
    console.log(`   📦 Nombre de colis: ${createOrderDto.packages.length}`);
    console.log(`   🚚 Type de livraison: ${createOrderDto.deliveryType}`);
    console.log(`   💳 Méthode de paiement: ${createOrderDto.paymentMethod}`);
    console.log(`   💰 Prix total: ${createOrderDto.totalPrice || 0} FCFA`);
    
    console.log('\n📦 Détails des colis:');
    createOrderDto.packages.forEach((pkg, index) => {
      console.log(`   ${index + 1}. Code: ${pkg.packageCode}`);
    });

    console.log('\n📞 Informations de livraison:');
    console.log(`    🏢 Gare de récupération: ${createOrderDto.destinationStation}`);
    console.log(`    📍 Lieu de livraison: ${createOrderDto.deliveryAddress}`);
    console.log(`    🏠 Lieu d'origine: ${createOrderDto.pickupAddress}`);
    console.log(`    📞 Téléphone destinataire: ${createOrderDto.receiverPhone}`);
    console.log(`    📞 Téléphone expéditeur: ${createOrderDto.senderPhone}`);
    console.log(`    🚚 Type de livraison: ${createOrderDto.deliveryType}`);
    console.log(`    💳 Mode de paiement: ${createOrderDto.paymentMethod}`);

    // Calcul de la distance si les coordonnées sont disponibles
    let calculatedDistance: number | undefined = createOrderDto.distanceKm;
    if (
      createOrderDto.stationLatitude && 
      createOrderDto.stationLongitude && 
      createOrderDto.deliveryLatitude && 
      createOrderDto.deliveryLongitude
    ) {
      calculatedDistance = this.calculateDistance(
        createOrderDto.stationLatitude,
        createOrderDto.stationLongitude,
        createOrderDto.deliveryLatitude,
        createOrderDto.deliveryLongitude
      );
      console.log(`\n📏 Calcul de la distance:`);
      console.log(`    Gare (${createOrderDto.stationLatitude}, ${createOrderDto.stationLongitude})`);
      console.log(`    Livraison (${createOrderDto.deliveryLatitude}, ${createOrderDto.deliveryLongitude})`);
      console.log(`    Distance: ${calculatedDistance} km`);
    } else {
      console.log(`\n⚠️  Coordonnées manquantes, distance non calculée`);
    }

    // Générer un numéro de commande unique
    const orderNumber = this.generateOrderNumber();
    console.log(`\n🎯 Numéro de commande généré: ${orderNumber}`);

    // Récupérer le nom du client depuis la base de données si non fourni
    let customerName = createOrderDto.customerName;
    if (!customerName) {
      try {
        const customer = await this.usersRepository.findOne({
          where: { id: createOrderDto.customerId }
        });
        if (customer) {
          customerName = `${customer.firstName} ${customer.lastName}`;
        }
      } catch (error) {
        console.log('⚠️ Impossible de récupérer le nom du client');
      }
    }

    // Créer la commande avec les informations essentielles
    const order = this.ordersRepository.create({
      orderNumber,
      customerId: createOrderDto.customerId,
      customerName: customerName,
      destinationStation: createOrderDto.destinationStation,
      deliveryAddress: createOrderDto.deliveryAddress,
      deliveryLatitude: createOrderDto.deliveryLatitude,
      deliveryLongitude: createOrderDto.deliveryLongitude,
      pickupAddress: createOrderDto.pickupAddress,
      stationLatitude: createOrderDto.stationLatitude,
      stationLongitude: createOrderDto.stationLongitude,
      distanceKm: calculatedDistance,
      receiverPhone: createOrderDto.receiverPhone,
      senderPhone: createOrderDto.senderPhone,
      deliveryType: createOrderDto.deliveryType,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
      totalPrice: createOrderDto.totalPrice || 0,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Créer les colis
    const packages = [];
    let totalWeight = 0;

    for (const packageData of createOrderDto.packages) {
      // Générer un code de colis unique si nécessaire
      let packageCode = packageData.packageCode;
      if (packageCode) {
        // Vérifier si le code existe déjà
        const existingPackage = await this.packagesRepository.findOne({
          where: { packageCode }
        });
        if (existingPackage) {
          // Générer un code unique en ajoutant un suffixe
          packageCode = `${packageData.packageCode}-${Date.now()}`;
        }
      } else {
        // Générer un code automatique
        packageCode = `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      }

      const packageEntity = this.packagesRepository.create({
        orderId: savedOrder.id,
        packageCode: packageCode,
      });

      const savedPackage = await this.packagesRepository.save(packageEntity);
      packages.push(savedPackage);
    }

    // Note: Pas de mise à jour du poids total car la structure simplifiée n'a pas de poids

    console.log(`\n✅ Commande créée avec succès!`);
    console.log(`   🆔 ID: ${savedOrder.id}`);
    console.log(`   📦 Nombre de colis créés: ${packages.length}`);
    console.log(`   💰 Prix final: ${createOrderDto.totalPrice || 0} FCFA`);
    console.log('=====================================\n');

    // Récupérer la commande complète avec tous les détails
    const completeOrder = await this.findOne(savedOrder.id);

    // Afficher toutes les informations de la commande dans le terminal
    console.log('\n📋 ===== RÉSUMÉ COMPLET DE LA COMMANDE =====');
    console.log(`🆔 Numéro de commande: ${completeOrder.orderNumber}`);
    console.log(`👤 Client ID: ${completeOrder.customerId}`);
    console.log(`👤 Nom du client: ${completeOrder.customerName || 'Non spécifié'}`);
    console.log(`\n📍 INFORMATIONS DE LIVRAISON:`);
    console.log(`   🏢 Gare de récupération: ${completeOrder.destinationStation}`);
    if (completeOrder.stationLatitude && completeOrder.stationLongitude) {
      console.log(`   📍 Coordonnées gare: (${completeOrder.stationLatitude}, ${completeOrder.stationLongitude})`);
    }
    console.log(`   🏠 Lieu de livraison: ${completeOrder.deliveryAddress}`);
    if (completeOrder.deliveryLatitude && completeOrder.deliveryLongitude) {
      console.log(`   📍 Coordonnées livraison: (${completeOrder.deliveryLatitude}, ${completeOrder.deliveryLongitude})`);
    }
    if (completeOrder.distanceKm) {
      console.log(`   📏 Distance calculée: ${completeOrder.distanceKm} km`);
    }
    console.log(`\n📞 CONTACTS:`);
    console.log(`   ☎️  Expéditeur: ${completeOrder.senderPhone}`);
    console.log(`   ☎️  Destinataire: ${completeOrder.receiverPhone}`);
    console.log(`\n🚚 LOGISTIQUE:`);
    console.log(`   📦 Type de livraison: ${completeOrder.deliveryType}`);
    console.log(`   💳 Mode de paiement: ${completeOrder.paymentMethod}`);
    console.log(`   📊 Statut: ${completeOrder.status}`);
    console.log(`\n📦 COLIS (${packages.length}):`);
    packages.forEach((pkg, index) => {
      console.log(`   ${index + 1}. Code: ${pkg.packageCode}`);
    });
    console.log(`\n💰 FINANCIER:`);
    console.log(`   💵 Prix total: ${completeOrder.totalPrice} FCFA`);
    console.log(`\n📅 DATES:`);
    console.log(`   📆 Créé le: ${new Date(completeOrder.createdAt).toLocaleString('fr-FR')}`);
    console.log('=====================================\n');

    // Retourner la commande avec ses colis
    return completeOrder;
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#PAKO-${year}${month}${day}-${random}`;
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    await this.ordersRepository.update(id, orderData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.ordersRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}