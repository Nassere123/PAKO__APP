import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryPersonsController } from './delivery-persons.controller';
import { DeliveryPersonsService } from './delivery-persons.service';
import { DeliveryPerson } from './entities/delivery-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryPerson])],
  controllers: [DeliveryPersonsController],
  providers: [DeliveryPersonsService],
  exports: [DeliveryPersonsService],
})
export class DeliveryPersonsModule {}
