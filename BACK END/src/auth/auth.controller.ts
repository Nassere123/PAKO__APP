import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { LoginWorkerDto } from './dto/login-worker.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Envoyer un code OTP',
    description: 'Envoie un code OTP de 6 chiffres au numéro de téléphone fourni'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Code OTP envoyé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Code OTP envoyé' },
        expiresIn: { type: 'number', example: 600 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Numéro de téléphone invalide' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Trop de tentatives. Réessayez dans 1 heure' 
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendVerificationCode(sendOtpDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Vérifier un code OTP',
    description: 'Vérifie le code OTP fourni et marque l\'utilisateur comme vérifié'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Code OTP vérifié avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Code OTP vérifié avec succès' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            phone: { type: 'string' },
            isVerified: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Code OTP invalide ou expiré' 
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyCode(verifyOtpDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Inscription d\'un utilisateur',
    description: 'Crée un nouveau compte utilisateur avec les informations fournies'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Compte créé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Compte créé avec succès' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string' },
            isVerified: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Un utilisateur avec ce numéro existe déjà' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données d\'inscription invalides' 
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Connexion d\'un utilisateur',
    description: 'Connecte un utilisateur avec son numéro de téléphone et un code OTP'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string' },
            isVerified: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Code OTP invalide ou utilisateur non trouvé' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données de connexion invalides' 
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('user-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Récupérer les informations complètes d\'un utilisateur',
    description: 'Récupère toutes les informations d\'un utilisateur par son numéro de téléphone'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Informations utilisateur récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string' },
            status: { type: 'string' },
            isVerified: { type: 'boolean' },
            otpCode: { type: 'string' },
            otpExpires: { type: 'string' },
            profilePhoto: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé' 
  })
  async getUserInfo(@Body() body: { phone: string }) {
    return this.authService.getUserInfo(body.phone);
  }

  @Post('user-by-id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Récupérer les informations d\'un utilisateur par ID',
    description: 'Récupère les informations d\'un utilisateur par son ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Informations utilisateur récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string' },
            status: { type: 'string' },
            isVerified: { type: 'boolean' },
            profilePhoto: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé' 
  })
  async getUserById(@Body() body: { userId: string }) {
    return this.authService.getUserById(body.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Déconnexion d\'un utilisateur',
    description: 'Déconnecte un utilisateur et met à jour son statut en base de données'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Déconnexion réussie',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Déconnexion réussie' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé' 
  })
  async logout(@Body() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }

  @Get('users-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtenir le statut de connexion de tous les utilisateurs',
    description: 'Retourne la liste des utilisateurs connectés et déconnectés avec leurs statistiques'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut des utilisateurs récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        connectedUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              isOnline: { type: 'boolean' },
              lastLoginAt: { type: 'string' },
              lastLogoutAt: { type: 'string' }
            }
          }
        },
        disconnectedUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              isOnline: { type: 'boolean' },
              lastLoginAt: { type: 'string' },
              lastLogoutAt: { type: 'string' }
            }
          }
        },
        stats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            connectedCount: { type: 'number' },
            disconnectedCount: { type: 'number' }
          }
        }
      }
    }
  })
  async getUsersStatus() {
    return this.authService.getAllUsersStatus();
  }

  @Post('create-worker')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Créer un travailleur (livreur ou agent)',
    description: 'Crée un nouveau compte travailleur avec mot de passe. Réservé à l\'administration.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Travailleur créé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Travailleur créé avec succès' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Un utilisateur avec ce numéro existe déjà' 
  })
  async createWorker(@Body() createWorkerDto: CreateWorkerDto) {
    return this.authService.createWorker(createWorkerDto);
  }

  @Post('login-worker')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Connexion d\'un travailleur avec mot de passe',
    description: 'Connecte un travailleur (livreur ou agent) avec son numéro de téléphone et son mot de passe'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string' },
            isVerified: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Identifiants invalides' 
  })
  async loginWorker(@Body() loginWorkerDto: LoginWorkerDto) {
    return this.authService.loginWorker(loginWorkerDto);
  }

  @Post('drivers/login')
  @ApiOperation({ summary: 'Connexion d\'un livreur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Identifiants invalides' 
  })
  async loginDriver(@Body() loginDriverDto: { phone: string; password: string }) {
    return this.authService.loginDriver(loginDriverDto);
  }

  @Post('drivers/logout/:id')
  @ApiOperation({ summary: 'Déconnexion d\'un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Déconnexion réussie' 
  })
  async logoutDriver(@Param('id') id: string) {
    await this.authService.logoutDriver(id);
    return { message: 'Déconnexion réussie' };
  }
}