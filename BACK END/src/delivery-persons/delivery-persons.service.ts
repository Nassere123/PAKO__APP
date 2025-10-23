import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryPerson, DeliveryPersonStatus } from './entities/delivery-person.entity';

@Injectable()
export class DeliveryPersonsService {
  constructor(
    @InjectRepository(DeliveryPerson)
    private deliveryPersonsRepository: Repository<DeliveryPerson>,
  ) {}

  async findAll(): Promise<DeliveryPerson[]> {
    return this.deliveryPersonsRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<DeliveryPerson> {
    const deliveryPerson = await this.deliveryPersonsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!deliveryPerson) {
      throw new NotFoundException(`Livreur avec l'ID ${id} non trouvé`);
    }
    return deliveryPerson;
  }

  async findByUserId(userId: string): Promise<DeliveryPerson | null> {
    return this.deliveryPersonsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findAvailable(): Promise<DeliveryPerson[]> {
    return this.deliveryPersonsRepository.find({
      where: { status: DeliveryPersonStatus.AVAILABLE, isActive: true },
      relations: ['user'],
    });
  }

  async create(deliveryPersonData: Partial<DeliveryPerson>): Promise<DeliveryPerson> {
    const deliveryPerson = this.deliveryPersonsRepository.create(deliveryPersonData);
    return this.deliveryPersonsRepository.save(deliveryPerson);
  }

  async update(id: string, deliveryPersonData: Partial<DeliveryPerson>): Promise<DeliveryPerson> {
    await this.deliveryPersonsRepository.update(id, deliveryPersonData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: DeliveryPersonStatus): Promise<DeliveryPerson> {
    await this.deliveryPersonsRepository.update(id, { status });
    return this.findOne(id);
  }

  async updateLocation(id: string, latitude: number, longitude: number): Promise<DeliveryPerson> {
    await this.deliveryPersonsRepository.update(id, {
      currentLatitude: latitude,
      currentLongitude: longitude,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deliveryPerson = await this.findOne(id);
    await this.deliveryPersonsRepository.remove(deliveryPerson);
  }

  // Méthodes spécifiques pour l'application livreur
  async getDeliveryPersonDashboard(deliveryPersonId: string): Promise<{
    deliveryPerson: DeliveryPerson;
    todayOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalEarnings: number;
    averageRating: number;
    currentLocation: { latitude: number; longitude: number } | null;
  }> {
    const deliveryPerson = await this.findOne(deliveryPersonId);
    
    // Statistiques des commandes du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrdersResult = await this.deliveryPersonsRepository
      .createQueryBuilder('dp')
      .leftJoin('dp.orders', 'order')
      .where('dp.id = :id', { id: deliveryPersonId })
      .andWhere('DATE(order.createdAt) = DATE(:today)', { today })
      .getCount();

    const pendingOrdersResult = await this.deliveryPersonsRepository
      .createQueryBuilder('dp')
      .leftJoin('dp.orders', 'order')
      .where('dp.id = :id', { id: deliveryPersonId })
      .andWhere('order.status IN (:...statuses)', { 
        statuses: ['pending', 'confirmed', 'picked_up', 'in_transit'] 
      })
      .getCount();

    const completedOrdersResult = await this.deliveryPersonsRepository
      .createQueryBuilder('dp')
      .leftJoin('dp.orders', 'order')
      .where('dp.id = :id', { id: deliveryPersonId })
      .andWhere('order.status = :status', { status: 'delivered' })
      .getCount();

    const earningsResult = await this.deliveryPersonsRepository
      .createQueryBuilder('dp')
      .leftJoin('dp.orders', 'order')
      .select('SUM(order.totalPrice)', 'total')
      .where('dp.id = :id', { id: deliveryPersonId })
      .andWhere('order.status = :status', { status: 'delivered' })
      .getRawOne();

    return {
      deliveryPerson,
      todayOrders: todayOrdersResult,
      pendingOrders: pendingOrdersResult,
      completedOrders: completedOrdersResult,
      totalEarnings: parseFloat(earningsResult?.total || '0'),
      averageRating: deliveryPerson.rating,
      currentLocation: deliveryPerson.currentLatitude && deliveryPerson.currentLongitude 
        ? { latitude: deliveryPerson.currentLatitude, longitude: deliveryPerson.currentLongitude }
        : null,
    };
  }

  async getNearbyOrders(deliveryPersonId: string, radius: number = 10): Promise<any[]> {
    const deliveryPerson = await this.findOne(deliveryPersonId);
    
    if (!deliveryPerson.currentLatitude || !deliveryPerson.currentLongitude) {
      return [];
    }

    // Requête pour trouver les commandes à proximité
    const nearbyOrders = await this.deliveryPersonsRepository
      .createQueryBuilder('dp')
      .leftJoin('dp.orders', 'order')
      .leftJoin('order.customer', 'customer')
      .select([
        'order.id',
        'order.orderNumber',
        'order.pickupAddress',
        'order.deliveryAddress',
        'order.totalPrice',
        'order.scheduledPickupTime',
        'customer.firstName',
        'customer.lastName',
        'customer.phone'
      ])
      .where('dp.id = :id', { id: deliveryPersonId })
      .andWhere('order.status = :status', { status: 'pending' })
      .andWhere(`
        ST_DWithin(
          ST_Point(order.pickupLongitude, order.pickupLatitude),
          ST_Point(:longitude, :latitude),
          :radius * 1000
        )
      `, {
        latitude: deliveryPerson.currentLatitude,
        longitude: deliveryPerson.currentLongitude,
        radius
      })
      .orderBy('order.scheduledPickupTime', 'ASC')
      .getMany();

    return nearbyOrders;
  }

  async updateDeliveryPersonRating(deliveryPersonId: string, newRating: number): Promise<DeliveryPerson> {
    const deliveryPerson = await this.findOne(deliveryPersonId);
    
    const totalRatings = deliveryPerson.totalRatings + 1;
    const averageRating = ((deliveryPerson.rating * deliveryPerson.totalRatings) + newRating) / totalRatings;
    
    await this.deliveryPersonsRepository.update(deliveryPersonId, {
      rating: averageRating,
      totalRatings: totalRatings,
    });
    
    return this.findOne(deliveryPersonId);
  }
}
