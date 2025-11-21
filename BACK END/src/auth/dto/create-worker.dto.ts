import { IsString, IsNotEmpty, IsEnum, IsOptional, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../users/entities/user.entity';

export class CreateWorkerDto {
  @ApiProperty({ 
    description: 'Prénom du travailleur',
    example: 'Jean'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ 
    description: 'Nom du travailleur',
    example: 'Kouassi'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ 
    description: 'Numéro de téléphone au format international',
    example: '+2250701234567'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+225\d{10}$/, {
    message: 'Le numéro de téléphone doit être au format international de Côte d\'Ivoire'
  })
  phone: string;

  @ApiProperty({ 
    description: 'Mot de passe (sera hashé automatiquement)',
    example: 'MotDePasse123!',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiProperty({ 
    description: 'Type de travailleur',
    enum: UserType,
    example: UserType.DRIVER
  })
  @IsEnum(UserType, { message: 'Le type doit être DRIVER ou un autre type de travailleur' })
  @IsNotEmpty()
  userType: UserType;

  @ApiProperty({ 
    description: 'Email (optionnel)',
    example: 'jean.kouassi@example.com',
    required: false
  })
  @IsOptional()
  @IsString()
  email?: string;
}

