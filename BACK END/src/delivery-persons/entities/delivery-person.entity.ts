import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Mission } from '../../missions/entities/mission.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';

export enum DeliveryPersonStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
}

@Entity('delivery_persons')
export class DeliveryPerson {
  @ApiProperty({ description: 'ID unique du livreur' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur associé' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Numéro de permis de conduire' })
  @Column({ type: 'varchar', length: 50, unique: true })
  licenseNumber: string;

  @ApiProperty({ description: 'Statut du livreur', enum: DeliveryPersonStatus })
  @Column({ type: 'enum', enum: DeliveryPersonStatus, default: DeliveryPersonStatus.OFFLINE })
  status: DeliveryPersonStatus;

  @ApiProperty({ description: 'Type de véhicule', enum: VehicleType })
  @Column({ type: 'enum', enum: VehicleType })
  vehicleType: VehicleType;

  @ApiProperty({ description: 'Marque du véhicule' })
  @Column({ type: 'varchar', length: 100 })
  vehicleBrand: string;

  @ApiProperty({ description: 'Modèle du véhicule' })
  @Column({ type: 'varchar', length: 100 })
  vehicleModel: string;

  @ApiProperty({ description: 'Numéro de plaque d\'immatriculation' })
  @Column({ type: 'varchar', length: 20, unique: true })
  plateNumber: string;

  @ApiProperty({ description: 'Couleur du véhicule' })
  @Column({ type: 'varchar', length: 50 })
  vehicleColor: string;

  @ApiProperty({ description: 'Capacité de charge en kg' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxLoadCapacity: number;

  @ApiProperty({ description: 'Latitude actuelle' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  currentLatitude?: number;

  @ApiProperty({ description: 'Longitude actuelle' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  currentLongitude?: number;

  @ApiProperty({ description: 'Note moyenne du livreur' })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @ApiProperty({ description: 'Nombre total d\'évaluations' })
  @Column({ type: 'int', default: 0 })
  totalRatings: number;

  @ApiProperty({ description: 'Livreur actif' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Note: Relation supprimée car deliveryPerson n'existe plus dans Order

  @OneToMany(() => Vehicle, vehicle => vehicle.deliveryPerson)
  vehicles: Vehicle[];

  @OneToMany(() => Mission, mission => mission.deliveryPerson)
  missions: Mission[];

  @OneToMany(() => Evaluation, evaluation => evaluation.deliveryPerson)
  evaluations: Evaluation[];
}
