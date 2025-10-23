import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
  @ApiProperty({ description: 'ID unique de l\'adresse' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nom de la rue' })
  @Column({ type: 'varchar', length: 255 })
  street: string;

  @ApiProperty({ description: 'Nom du quartier' })
  @Column({ type: 'varchar', length: 100 })
  neighborhood: string;

  @ApiProperty({ description: 'Nom de la commune' })
  @Column({ type: 'varchar', length: 100 })
  commune: string;

  @ApiProperty({ description: 'Nom de la ville' })
  @Column({ type: 'varchar', length: 100 })
  city: string;

  @ApiProperty({ description: 'Code postal' })
  @Column({ type: 'varchar', length: 20 })
  postalCode: string;

  @ApiProperty({ description: 'Complément d\'adresse' })
  @Column({ type: 'text', nullable: true })
  additionalInfo?: string;

  @ApiProperty({ description: 'Latitude' })
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @ApiProperty({ description: 'Longitude' })
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @ApiProperty({ description: 'Adresse par défaut' })
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @ApiProperty({ description: 'ID de l\'utilisateur propriétaire' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.addresses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
