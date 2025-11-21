import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';

export enum PackageType {
  ALIMENTAIRE = 'alimentaire',
  VESTIMENTAIRE = 'vestimentaire',
  ELECTRONIQUE = 'electronique',
  DOCUMENTAIRE = 'documentaire',
  COSMETIQUE = 'cosmetique',
  PIECE_DETACHEE = 'piece_detachee',
  CADEAU = 'cadeau',
  MOBILIER = 'mobilier',
  STANDARD = 'standard',
  OTHER = 'autre',
}

export enum PackageStatus {
  RECEIVED = 'received',             // Colis reçu à la gare
  VERIFIED = 'verified',             // Colis vérifié
  READY_FOR_DELIVERY = 'ready_for_delivery', // Prêt pour attribution à un livreur
  ASSIGNED = 'assigned',             // Assigné à un livreur
  IN_DELIVERY = 'in_delivery',       // En cours de livraison
  DELIVERED = 'delivered',           // Livré
  CANCELLED = 'cancelled',           // Colis annulé/retourné
}

@Entity('packages')
export class Package {
  @ApiProperty({ description: 'ID unique du colis' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de la commande' })
  @Column({ type: 'uuid' })
  orderId: string;

  // === INFORMATIONS ESSENTIELLES ===
  
  @ApiProperty({ description: 'Code du colis (unique)' })
  @Column({ type: 'varchar', length: 50, unique: true })
  packageCode: string;

  // === CHAMPS SYSTÈME ===
  
  @ApiProperty({ description: 'Statut du colis', enum: PackageStatus })
  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.RECEIVED })
  status: PackageStatus;

  @ApiProperty({ description: 'Identifiant du livreur assigné', required: false })
  @Column({ type: 'uuid', nullable: true })
  assignedDriverId?: string | null;

  @ApiProperty({ description: 'Nom du livreur assigné', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedDriverName?: string | null;

  @ApiProperty({ description: 'Date d\'attribution au livreur', required: false })
  @Column({ type: 'timestamp with time zone', nullable: true })
  assignedAt?: Date | null;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  // === RELATIONS ===
  
  @ManyToOne(() => Order, order => order.packages)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
