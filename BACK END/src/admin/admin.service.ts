import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';
import { Station } from '../stations/entities/station.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(DeliveryPerson)
    private deliveryPersonsRepository: Repository<DeliveryPerson>,
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
  ) {}

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalDeliveryPersons: number;
    totalStations: number;
    activeOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    const [
      totalUsers,
      totalOrders,
      totalDeliveryPersons,
      totalStations,
      activeOrders,
      completedOrders,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.ordersRepository.count(),
      this.deliveryPersonsRepository.count(),
      this.stationsRepository.count(),
      this.ordersRepository.count({ where: { status: OrderStatus.IN_TRANSIT } }),
      this.ordersRepository.count({ where: { status: OrderStatus.DELIVERED } }),
    ]);

    const revenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();

    return {
      totalUsers,
      totalOrders,
      totalDeliveryPersons,
      totalStations,
      activeOrders,
      completedOrders,
      totalRevenue: parseFloat(revenueResult?.total || '0'),
    };
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'deliveryPerson'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTopDeliveryPersons(limit: number = 5): Promise<DeliveryPerson[]> {
    return this.deliveryPersonsRepository.find({
      relations: ['user'],
      order: { rating: 'DESC' },
      take: limit,
    });
  }
}