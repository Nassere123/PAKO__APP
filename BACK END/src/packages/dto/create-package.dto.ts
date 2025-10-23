import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsBoolean } from 'class-validator';

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

export class CreatePackageDto {
  @ApiProperty({ description: 'ID de la commande' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Code du colis', example: 'ABC123' })
  @IsString()
  packageCode: string;

  @ApiProperty({ description: 'Description du colis', example: 'Colis alimentaire', required: false })
  @IsOptional()
  @IsString()
  packageDescription?: string;

  @ApiProperty({ description: 'Type de colis', enum: PackageType })
  @IsEnum(PackageType)
  packageType: PackageType;

  @ApiProperty({ description: 'Poids en kg', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: 'Longueur en cm', required: false })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiProperty({ description: 'Largeur en cm', required: false })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ description: 'Hauteur en cm', required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ description: 'Valeur déclarée', required: false })
  @IsOptional()
  @IsNumber()
  declaredValue?: number;

  @ApiProperty({ description: 'Fragile', required: false })
  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @ApiProperty({ description: 'Nécessite une signature', required: false })
  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean;

  @ApiProperty({ description: 'Instructions spéciales', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({ description: 'Photo du colis', required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: 'Code de suivi', required: false })
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
