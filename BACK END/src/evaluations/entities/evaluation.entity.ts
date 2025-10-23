import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { DeliveryPerson } from '../../delivery-persons/entities/delivery-person.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('evaluations')
export class Evaluation {
  @ApiProperty({ description: 'ID unique de l\'évaluation' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Note donnée (1-5)' })
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({ description: 'Commentaire de l\'évaluation' })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'Date de l\'évaluation' })
  @CreateDateColumn()
  evaluationDate: Date;

  @ApiProperty({ description: 'ID du client qui évalue' })
  @Column({ type: 'uuid' })
  customerId: string;

  @ApiProperty({ description: 'ID du livreur évalué' })
  @Column({ type: 'uuid' })
  deliveryPersonId: string;

  @ApiProperty({ description: 'ID de la commande évaluée' })
  @Column({ type: 'uuid' })
  orderId: string;

  // Relations
  @ManyToOne(() => User, user => user.evaluationsGiven)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => DeliveryPerson, deliveryPerson => deliveryPerson.evaluations)
  @JoinColumn({ name: 'deliveryPersonId' })
  deliveryPerson: DeliveryPerson;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
