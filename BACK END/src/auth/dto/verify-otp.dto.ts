import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ 
    description: 'Numéro de téléphone',
    example: '+2250701234567'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+225\d{10}$/, {
    message: 'Le numéro de téléphone doit être au format international de Côte d\'Ivoire'
  })
  phone: string;

  @ApiProperty({ 
    description: 'Code OTP de 6 chiffres',
    example: '123456',
    minLength: 6,
    maxLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Le code OTP doit contenir exactement 6 chiffres' })
  @Matches(/^\d{6}$/, { message: 'Le code OTP doit contenir uniquement des chiffres' })
  code: string;
}
