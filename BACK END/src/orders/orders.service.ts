import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Package } from '../packages/entities/package.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
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

    // Générer un numéro de commande unique
    const orderNumber = this.generateOrderNumber();
    console.log(`\n🎯 Numéro de commande généré: ${orderNumber}`);

    // Créer la commande avec les informations essentielles
    const order = this.ordersRepository.create({
      orderNumber,
      customerId: createOrderDto.customerId,
      destinationStation: createOrderDto.destinationStation,
      deliveryAddress: createOrderDto.deliveryAddress,
      pickupAddress: createOrderDto.pickupAddress,
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

    // Retourner la commande avec ses colis
    return this.findOne(savedOrder.id);
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