import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Package } from '../../packages/entities/package.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @ApiProperty({ description: 'ID unique de la commande' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numéro de commande' })
  @Column({ type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @ApiProperty({ description: 'ID du client (UUID ou téléphone)' })
  @Column({ type: 'varchar' })
  customerId: string;

  @ApiProperty({ description: 'Nom complet du client qui a passé la commande' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName?: string;

  // === INFORMATIONS ESSENTIELLES ===
  
  @ApiProperty({ description: 'Gare de récupération (station de destination)' })
  @Column({ type: 'varchar', length: 255 })
  destinationStation: string;

  @ApiProperty({ description: 'Lieu de livraison (adresse du destinataire)' })
  @Column({ type: 'text' })
  deliveryAddress: string;

  @ApiProperty({ description: 'Latitude du lieu de livraison' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  deliveryLatitude?: number;

  @ApiProperty({ description: 'Longitude du lieu de livraison' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  deliveryLongitude?: number;

  @ApiProperty({ description: 'Lieu d\'origine du colis (adresse de prise)' })
  @Column({ type: 'text' })
  pickupAddress: string;

  @ApiProperty({ description: 'Latitude de la gare de destination' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  stationLatitude?: number;

  @ApiProperty({ description: 'Longitude de la gare de destination' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  stationLongitude?: number;

  @ApiProperty({ description: 'Distance en kilomètres entre la gare et le lieu de livraison' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm?: number;

  @ApiProperty({ description: 'Téléphone du destinataire' })
  @Column({ type: 'varchar', length: 20 })
  receiverPhone: string;

  @ApiProperty({ description: 'Téléphone de l\'expéditeur' })
  @Column({ type: 'varchar', length: 20 })
  senderPhone: string;

  @ApiProperty({ description: 'Type de livraison', enum: ['standard', 'express'] })
  @Column({ type: 'enum', enum: ['standard', 'express'], default: 'standard' })
  deliveryType: string;

  @ApiProperty({ description: 'Mode de paiement', enum: ['cash', 'wave', 'orange'] })
  @Column({ type: 'enum', enum: ['cash', 'wave', 'orange'], default: 'cash' })
  paymentMethod: string;

  // === CHAMPS SYSTÈME ===
  
  @ApiProperty({ description: 'Statut de la commande', enum: OrderStatus })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ description: 'Statut du paiement', enum: PaymentStatus })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Prix total de la commande' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  // === RELATIONS ===
  
  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @OneToMany(() => Package, pkg => pkg.order)
  packages: Package[];
}
