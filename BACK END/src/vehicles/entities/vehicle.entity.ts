import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryPerson } from '../../delivery-persons/entities/delivery-person.entity';

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
}

@Entity('vehicles')
export class Vehicle {
  @ApiProperty({ description: 'ID unique du véhicule' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Marque du véhicule' })
  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @ApiProperty({ description: 'Modèle du véhicule' })
  @Column({ type: 'varchar', length: 100 })
  model: string;

  @ApiProperty({ description: 'Numéro d\'immatriculation' })
  @Column({ type: 'varchar', length: 20, unique: true })
  plateNumber: string;

  @ApiProperty({ description: 'Capacité de charge en kg' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  loadCapacity: number;

  @ApiProperty({ description: 'Type de véhicule', enum: VehicleType })
  @Column({ type: 'enum', enum: VehicleType })
  vehicleType: VehicleType;

  @ApiProperty({ description: 'Couleur du véhicule' })
  @Column({ type: 'varchar', length: 50 })
  color: string;

  @ApiProperty({ description: 'Année de fabrication' })
  @Column({ type: 'int' })
  year: number;

  @ApiProperty({ description: 'Véhicule actif' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'ID du livreur propriétaire' })
  @Column({ type: 'uuid' })
  deliveryPersonId: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => DeliveryPerson, deliveryPerson => deliveryPerson.vehicles)
  @JoinColumn({ name: 'deliveryPersonId' })
  deliveryPerson: DeliveryPerson;
}
