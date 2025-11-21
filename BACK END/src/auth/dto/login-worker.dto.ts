import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWorkerDto {
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
    description: 'Mot de passe',
    example: 'MotDePasse123!',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}

