import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
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

@Entity('drivers')
export class DeliveryPerson {
  @ApiProperty({ description: 'ID unique du livreur' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Prénom du livreur' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Nom du livreur' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ description: 'Numéro de téléphone du livreur' })
  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @ApiProperty({ description: 'Email du livreur' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Mot de passe (hashé)' })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ description: 'Numéro de permis de conduire' })
  @Column({ type: 'varchar', length: 50, unique: true })
  licenseNumber: string;

  @ApiProperty({ description: 'Statut du livreur', enum: DeliveryPersonStatus })
  @Column({ type: 'enum', enum: DeliveryPersonStatus, default: DeliveryPersonStatus.OFFLINE })
  status: DeliveryPersonStatus;

  @ApiProperty({ description: 'Livreur en ligne' })
  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @ApiProperty({ description: 'Date de dernière connexion' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Date de dernière déconnexion' })
  @Column({ type: 'timestamp', nullable: true })
  lastLogoutAt?: Date;

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
  @OneToMany(() => Vehicle, vehicle => vehicle.deliveryPerson)
  vehicles: Vehicle[];

  @OneToMany(() => Mission, mission => mission.deliveryPerson)
  missions: Mission[];

  @OneToMany(() => Evaluation, evaluation => evaluation.deliveryPerson)
  evaluations: Evaluation[];
}
