import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';
import { Station } from '../stations/entities/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, DeliveryPerson, Station])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}