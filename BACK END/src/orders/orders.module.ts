import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Package } from '../packages/entities/package.entity';
import { User } from '../users/entities/user.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Package, User, DeliveryPerson])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}