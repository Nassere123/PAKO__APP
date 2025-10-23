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
  RECEIVED = 'received',           // Colis reçu
  IN_DELIVERY = 'in_delivery',      // Colis en cours de livraison
  CANCELLED = 'cancelled',         // Colis annulé
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
