import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum DeliveryType {
  STANDARD = 'standard',
  EXPRESS = 'express',
}

export enum PaymentMethod {
  CASH = 'cash',
  WAVE = 'wave',
  ORANGE = 'orange',
}

export class CreatePackageDto {
  // === INFORMATIONS ESSENTIELLES ===
  
  @ApiProperty({ description: 'Code du colis (unique)', example: 'PKG-123456-ABC' })
  @IsString()
  packageCode: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID du client (UUID) ou téléphone de l\'utilisateur' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Nom complet du client', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  // === INFORMATIONS ESSENTIELLES ===
  
  @ApiProperty({ description: 'Gare de récupération (station de destination)', example: 'Gare de Cocody' })
  @IsString()
  destinationStation: string;

  @ApiProperty({ description: 'Lieu de livraison (adresse du destinataire)', example: 'Cocody, Riviera 2' })
  @IsString()
  deliveryAddress: string;

  @ApiProperty({ description: 'Latitude du lieu de livraison', required: false })
  @IsOptional()
  @IsNumber()
  deliveryLatitude?: number;

  @ApiProperty({ description: 'Longitude du lieu de livraison', required: false })
  @IsOptional()
  @IsNumber()
  deliveryLongitude?: number;

  @ApiProperty({ description: 'Lieu d\'origine du colis (adresse de prise)', example: 'Abidjan, Plateau' })
  @IsString()
  pickupAddress: string;

  @ApiProperty({ description: 'Latitude de la gare de destination', required: false })
  @IsOptional()
  @IsNumber()
  stationLatitude?: number;

  @ApiProperty({ description: 'Longitude de la gare de destination', required: false })
  @IsOptional()
  @IsNumber()
  stationLongitude?: number;

  @ApiProperty({ description: 'Distance en kilomètres', required: false })
  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @ApiProperty({ description: 'Téléphone du destinataire', example: '+225076543210' })
  @IsString()
  receiverPhone: string;

  @ApiProperty({ description: 'Téléphone de l\'expéditeur', example: '+225071234567' })
  @IsString()
  senderPhone: string;

  @ApiProperty({ description: 'Type de livraison', example: 'standard' })
  @IsString()
  deliveryType: string;

  @ApiProperty({ description: 'Mode de paiement', example: 'cash' })
  @IsString()
  paymentMethod: string;

  // === CHAMPS OPTIONNELS ===
  
  @ApiProperty({ description: 'Prix total', required: false })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiProperty({ description: 'Liste des colis', type: [CreatePackageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackageDto)
  packages: CreatePackageDto[];
}
