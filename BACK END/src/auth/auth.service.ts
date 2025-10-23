import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType, UserStatus } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Les DTOs sont maintenant dans des fichiers séparés

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async sendVerificationCode(sendOtpDto: SendOtpDto): Promise<{ message: string; expiresIn: number }> {
    const { phone, firstName, lastName } = sendOtpDto;
    
    // Debug: Afficher les données reçues
    console.log('=== DEBUG SEND OTP ===');
    console.log('Phone:', phone);
    console.log('FirstName:', firstName);
    console.log('LastName:', lastName);
    console.log('=====================');
    
    // Générer un code OTP de 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Vérifier si l'utilisateur existe
    let user = await this.usersService.findByPhone(phone);
    
    if (user) {
      // Vérifier les tentatives OTP
      if (user.otpAttempts <= 0 && user.lastOtpAttempt && 
          new Date().getTime() - user.lastOtpAttempt.getTime() < 60 * 60 * 1000) { // 1 heure
        throw new BadRequestException('Trop de tentatives. Réessayez dans 1 heure.');
      }

      // Mettre à jour le code OTP et les informations utilisateur si fournies
      const updateData: any = {
        otpCode,
        otpExpires: expiresAt,
        otpAttempts: 3, // Reset des tentatives
        lastOtpAttempt: new Date(),
      };

      // Mettre à jour le prénom et nom si fournis
      if (firstName && firstName.trim() !== '') {
        updateData.firstName = firstName.trim();
      }
      if (lastName && lastName.trim() !== '') {
        updateData.lastName = lastName.trim();
      }

      await this.userRepository.update(user.id, updateData);

      // Récupérer l'utilisateur avec les données mises à jour
      user = await this.userRepository.findOne({ where: { id: user.id } });
    } else {
      // Vérifier si un utilisateur avec le même numéro ET les mêmes noms existe déjà
      const existingUserWithSameNames = await this.userRepository.findOne({
        where: { 
          phone,
          firstName: firstName && firstName.trim() !== '' ? firstName.trim() : '',
          lastName: lastName && lastName.trim() !== '' ? lastName.trim() : ''
        }
      });

      if (existingUserWithSameNames) {
        // Mettre à jour l'utilisateur existant avec le nouveau code OTP
        await this.userRepository.update(existingUserWithSameNames.id, {
          otpCode,
          otpExpires: expiresAt,
          firstName: firstName && firstName.trim() !== '' ? firstName.trim() : existingUserWithSameNames.firstName,
          lastName: lastName && lastName.trim() !== '' ? lastName.trim() : existingUserWithSameNames.lastName,
          otpAttempts: 3,
          lastOtpAttempt: new Date(),
        });
        user = await this.userRepository.findOne({ where: { id: existingUserWithSameNames.id } });
      } else {
        // Ne pas créer d'utilisateur ici - seulement stocker temporairement les données
        // L'utilisateur sera créé lors de l'inscription (register)
        console.log('📝 Utilisateur non trouvé - données temporaires stockées pour inscription');
        console.log(`   Téléphone: ${phone}`);
        console.log(`   Nom: ${firstName} ${lastName}`);
        console.log(`   Code OTP: ${otpCode}`);
        
        // Retourner les informations sans créer d'utilisateur
        return {
          message: `Code de vérification envoyé au ${phone}`,
          expiresIn: 600 // 10 minutes
        };
      }
    }

    // TODO: Envoyer le SMS avec le code OTP
    if (user) {
      console.log('=== DEBUG USER DATA ===');
      console.log('User firstName:', user.firstName);
      console.log('User lastName:', user.lastName);
      console.log('Received firstName:', firstName);
      console.log('Received lastName:', lastName);
      console.log('======================');
      
      // Utiliser les données reçues du frontend en priorité, sinon celles de l'utilisateur
      const displayFirstName = (firstName && firstName.trim() !== '') ? firstName.trim() : (user.firstName && user.firstName.trim() !== '') ? user.firstName.trim() : '';
      const displayLastName = (lastName && lastName.trim() !== '') ? lastName.trim() : (user.lastName && user.lastName.trim() !== '') ? user.lastName.trim() : '';
      
      const userDisplayName = (displayFirstName || displayLastName) 
        ? `${displayFirstName} ${displayLastName}`.trim()
        : 'Utilisateur';
      
      console.log(`Code OTP pour ${userDisplayName} (${phone}): ${otpCode}`);
    } else {
      console.log(`Code OTP pour nouveau utilisateur (${phone}): ${otpCode}`);
    }

    return { 
      message: 'Code OTP envoyé',
      expiresIn: 600 // 10 minutes en secondes
    };
  }

  async verifyCode(verifyOtpDto: VerifyOtpDto): Promise<{ message: string; user: Partial<User> }> {
    const { phone, code } = verifyOtpDto;
    
    const user = await this.userRepository.findOne({
      where: { phone, otpCode: code }
    });

    if (!user || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    // Vérifier les tentatives restantes
    if (user.otpAttempts <= 0) {
      throw new BadRequestException('Trop de tentatives. Demandez un nouveau code.');
    }

    // Décrémenter les tentatives
    await this.userRepository.update(user.id, {
      otpAttempts: user.otpAttempts - 1,
    });

    // Marquer comme vérifié
    await this.userRepository.update(user.id, {
      isVerified: true,
      otpCode: null,
      otpExpires: null,
    });

    return {
      message: 'Code OTP vérifié avec succès',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: true,
      }
    };
  }

  async register(registerDto: RegisterDto): Promise<{ message: string; user: Partial<User> }> {
    const { firstName, lastName, phone, email } = registerDto;

    // Vérifier si un utilisateur avec le même numéro ET les mêmes noms existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { 
        phone, 
        firstName, 
        lastName 
      }
    });

    if (existingUser) {
      // Mettre à jour l'utilisateur existant avec les nouvelles données
      await this.userRepository.update(existingUser.id, {
        email,
        status: UserStatus.ACTIVE,
        isVerified: true,
      });
      
      const updatedUser = await this.usersService.findOne(existingUser.id);
      
      return {
        message: 'Compte mis à jour avec succès',
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          email: updatedUser.email,
          userType: updatedUser.userType,
          isVerified: updatedUser.isVerified,
        }
      };
    } else {
      // Créer un nouvel utilisateur (même numéro mais noms différents)
      const newUser = await this.userRepository.save({
        firstName,
        lastName,
        phone,
        email,
        userType: UserType.CUSTOMER,
        status: UserStatus.ACTIVE,
        isVerified: true,
        otpAttempts: 3,
      });

      return {
        message: 'Compte créé avec succès',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          email: newUser.email,
          userType: newUser.userType,
          isVerified: newUser.isVerified,
        }
      };
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
    const { phone, otpCode } = loginDto;

    // Trouver l'utilisateur avec le code OTP correspondant
    const user = await this.userRepository.findOne({
      where: { 
        phone, 
        otpCode 
      }
    });

    if (!user || !user.isVerified) {
      throw new UnauthorizedException('Utilisateur non trouvé ou non vérifié');
    }

    // Vérifier le code OTP
    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Compte inactif');
    }

    // Nettoyer le code OTP après connexion réussie
    await this.userRepository.update(user.id, {
      otpCode: null,
      otpExpires: null,
    });

    const payload = { sub: user.id, phone: user.phone, userType: user.userType };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
      }
    };
  }

  async getUserInfo(phone: string): Promise<{ user: Partial<User> }> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        status: user.status,
        isVerified: user.isVerified,
        otpCode: user.otpCode,
        otpExpires: user.otpExpires,
        profilePhoto: user.profilePhoto,
        address: user.address,
        city: user.city,
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    };
  }

  async getUserById(userId: string): Promise<{ user: Partial<User> }> {
    try {
      // Vérifier si l'ID est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new BadRequestException(`ID utilisateur invalide: ${userId}. Un UUID est requis.`);
      }
      
      const user = await this.usersService.findOne(userId);
      
      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
          status: user.status,
          isVerified: user.isVerified,
          profilePhoto: user.profilePhoto,
          address: user.address,
          city: user.city,
          country: user.country,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Utilisateur non trouvé');
      }
      throw error;
    }
  }
}