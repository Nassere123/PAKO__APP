import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum StationType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  HUB = 'hub',
}

export enum StationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('stations')
export class Station {
  @ApiProperty({ description: 'ID unique de la station' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nom de la station' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Description de la station' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type de station', enum: StationType })
  @Column({ type: 'enum', enum: StationType })
  type: StationType;

  @ApiProperty({ description: 'Statut de la station', enum: StationStatus })
  @Column({ type: 'enum', enum: StationStatus, default: StationStatus.ACTIVE })
  status: StationStatus;

  @ApiProperty({ description: 'Adresse de la station' })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({ description: 'Latitude de la station' })
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @ApiProperty({ description: 'Longitude de la station' })
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @ApiProperty({ description: 'Ville de la station' })
  @Column({ type: 'varchar', length: 100 })
  city: string;

  @ApiProperty({ description: 'Pays de la station' })
  @Column({ type: 'varchar', length: 100 })
  country: string;

  @ApiProperty({ description: 'Code postal' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @ApiProperty({ description: 'Numéro de téléphone de la station' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Email de la station' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Heures d\'ouverture' })
  @Column({ type: 'json', nullable: true })
  openingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };

  @ApiProperty({ description: 'Capacité de stockage' })
  @Column({ type: 'int', nullable: true })
  storageCapacity?: number;

  @ApiProperty({ description: 'Capacité actuelle' })
  @Column({ type: 'int', default: 0 })
  currentCapacity: number;

  @ApiProperty({ description: 'Station active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;
}
