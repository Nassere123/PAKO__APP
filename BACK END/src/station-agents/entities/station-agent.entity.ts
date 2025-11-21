import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('station_agents')
export class StationAgent {
  @ApiProperty({ description: 'ID unique de l\'agent de gare' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Prénom de l\'agent' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Nom de l\'agent' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ description: 'Numéro de téléphone de l\'agent' })
  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @ApiProperty({ description: 'Email de l\'agent' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Mot de passe (hashé)' })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ description: 'ID de la gare d\'attache' })
  @Column({ type: 'varchar', length: 100 })
  stationId: string;

  @ApiProperty({ description: 'Nom de la gare d\'attache' })
  @Column({ type: 'varchar', length: 255 })
  stationName: string;

  @ApiProperty({ description: 'Agent en ligne' })
  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @ApiProperty({ description: 'Date de dernière connexion' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Date de dernière déconnexion' })
  @Column({ type: 'timestamp', nullable: true })
  lastLogoutAt?: Date;

  @ApiProperty({ description: 'Agent actif' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;
}

