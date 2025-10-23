import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum IncidentType {
  DELIVERY_DELAY = 'delivery_delay',
  PACKAGE_DAMAGED = 'package_damaged',
  PACKAGE_LOST = 'package_lost',
  CUSTOMER_NOT_AVAILABLE = 'customer_not_available',
  VEHICLE_BREAKDOWN = 'vehicle_breakdown',
  OTHER = 'other',
}

export enum IncidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('incidents')
export class Incident {
  @ApiProperty({ description: 'ID unique de l\'incident' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Type d\'incident', enum: IncidentType })
  @Column({ type: 'enum', enum: IncidentType })
  type: IncidentType;

  @ApiProperty({ description: 'Statut de l\'incident', enum: IncidentStatus })
  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @ApiProperty({ description: 'Description de l\'incident' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Action corrective prise' })
  @Column({ type: 'text', nullable: true })
  correctiveAction?: string;

  @ApiProperty({ description: 'Date de déclaration' })
  @CreateDateColumn()
  reportedAt: Date;

  @ApiProperty({ description: 'Date de résolution' })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'ID de l\'utilisateur qui a déclaré l\'incident' })
  @Column({ type: 'uuid' })
  reportedBy: string;

  // Relations
  @ManyToOne(() => User, user => user.incidents)
  @JoinColumn({ name: 'reportedBy' })
  reporter: User;
}
