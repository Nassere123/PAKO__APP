import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
import { Incident } from '../../incidents/entities/incident.entity';

export enum UserType {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  STATION_AGENT = 'station_agent',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID unique de l\'utilisateur' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Prénom de l\'utilisateur' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Nom de l\'utilisateur' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ description: 'Numéro de téléphone' })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ description: 'Email de l\'utilisateur', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Mot de passe hashé (pour les travailleurs uniquement)', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @ApiProperty({ description: 'Type d\'utilisateur', enum: UserType })
  @Column({ type: 'enum', enum: UserType, default: UserType.CUSTOMER })
  userType: UserType;

  @ApiProperty({ description: 'Statut de l\'utilisateur', enum: UserStatus })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ description: 'Code OTP de vérification (6 chiffres)' })
  @Column({ type: 'varchar', length: 6, nullable: true })
  otpCode?: string;

  @ApiProperty({ description: 'Date d\'expiration du code OTP' })
  @Column({ type: 'timestamp', nullable: true })
  otpExpires?: Date;

  @ApiProperty({ description: 'Utilisateur vérifié par OTP' })
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Nombre de tentatives OTP restantes' })
  @Column({ type: 'int', default: 3 })
  otpAttempts: number;

  @ApiProperty({ description: 'Date de la dernière tentative OTP' })
  @Column({ type: 'timestamp', nullable: true })
  lastOtpAttempt?: Date;

  @ApiProperty({ description: 'Photo de profil', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePhoto?: string;

  @ApiProperty({ description: 'Adresse de l\'utilisateur', required: false })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ description: 'Ville de l\'utilisateur', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @ApiProperty({ description: 'Pays de l\'utilisateur', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @ApiProperty({ description: 'Utilisateur actuellement en ligne' })
  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @ApiProperty({ description: 'Date de dernière connexion' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Date de dernière déconnexion' })
  @Column({ type: 'timestamp', nullable: true })
  lastLogoutAt?: Date;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

  @OneToMany(() => Evaluation, evaluation => evaluation.customer)
  evaluationsGiven: Evaluation[];

  @OneToMany(() => Incident, incident => incident.reporter)
  incidents: Incident[];
}
