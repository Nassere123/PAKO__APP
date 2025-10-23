import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryPerson } from '../../delivery-persons/entities/delivery-person.entity';
import { Order } from '../../orders/entities/order.entity';

export enum MissionStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('missions')
export class Mission {
  @ApiProperty({ description: 'ID unique de la mission' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numéro de mission' })
  @Column({ type: 'varchar', length: 20, unique: true })
  missionNumber: string;

  @ApiProperty({ description: 'Statut de la mission', enum: MissionStatus })
  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.PENDING })
  status: MissionStatus;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date d\'assignation' })
  @Column({ type: 'timestamp', nullable: true })
  assignedAt?: Date;

  @ApiProperty({ description: 'Date de début' })
  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'Date de fin' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'ID du livreur assigné' })
  @Column({ type: 'uuid', nullable: true })
  deliveryPersonId?: string;

  // Relations
  @ManyToOne(() => DeliveryPerson, deliveryPerson => deliveryPerson.missions)
  @JoinColumn({ name: 'deliveryPersonId' })
  deliveryPerson?: DeliveryPerson;

  // Note: Relation supprimée car mission n'existe plus dans Order
}
