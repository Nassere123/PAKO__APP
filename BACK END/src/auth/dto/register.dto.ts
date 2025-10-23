import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Prénom de l\'utilisateur',
    example: 'Jean',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  firstName: string;

  @ApiProperty({ 
    description: 'Nom de l\'utilisateur',
    example: 'Dupont',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  lastName: string;

  @ApiProperty({ 
    description: 'Numéro de téléphone au format international',
    example: '+2250701234567'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+225\d{10}$/, {
    message: 'Le numéro de téléphone doit être au format international de Côte d\'Ivoire (ex: +2250701234567)'
  })
  phone: string;

  @ApiProperty({ 
    description: 'Adresse email (optionnel)',
    example: 'jean.dupont@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  email?: string;
}
