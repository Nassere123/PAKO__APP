import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserType, UserStatus } from '../users/entities/user.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';
import { StationAgent } from '../station-agents/entities/station-agent.entity';
import { UsersService } from '../users/users.service';
import { DeliveryPersonsService } from '../delivery-persons/delivery-persons.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';

// Les DTOs sont maintenant dans des fichiers séparés

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DeliveryPerson)
    private deliveryPersonRepository: Repository<DeliveryPerson>,
    @InjectRepository(StationAgent)
    private stationAgentRepository: Repository<StationAgent>,
    private usersService: UsersService,
    private deliveryPersonsService: DeliveryPersonsService,
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
    
    console.log('User exists:', !!user);
    if (user) {
      console.log('User status:', user.status);
    }
    
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
      // Pour les nouveaux utilisateurs, créer un utilisateur temporaire avec le code OTP
      // Cet utilisateur sera conservé et complété lors de l'inscription
      console.log('📝 Création d\'un utilisateur temporaire pour inscription');
      console.log(`   Téléphone: ${phone}`);
      console.log(`   Nom: ${firstName} ${lastName}`);
      console.log(`   Code OTP: ${otpCode}`);
      
      // Créer un utilisateur temporaire
      const newUser = await this.userRepository.save({
        firstName: firstName && firstName.trim() !== '' ? firstName.trim() : '',
        lastName: lastName && lastName.trim() !== '' ? lastName.trim() : '',
        phone,
        otpCode,
        otpExpires: expiresAt,
        otpAttempts: 3,
        lastOtpAttempt: new Date(),
        userType: UserType.CUSTOMER,
        status: UserStatus.INACTIVE,
        isVerified: false,
      });
      
      user = newUser;
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
    
    // Debug: Afficher les données reçues
    console.log('=== DEBUG VERIFY OTP ===');
    console.log('Phone:', phone);
    console.log('Code:', code);
    console.log('========================');
    
    const user = await this.userRepository.findOne({
      where: { phone, otpCode: code }
    });

    // Debug: Afficher l'état de la recherche
    console.log('=== DEBUG USER SEARCH ===');
    console.log('User found:', !!user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('OTP Code stored:', user.otpCode);
      console.log('OTP Code received:', code);
      console.log('OTP Expires:', user.otpExpires);
      console.log('Current time:', new Date());
      console.log('Is OTP expired:', user.otpExpires && user.otpExpires < new Date());
    } else {
      // Chercher tous les utilisateurs avec ce numéro pour déboguer
      const allUsersWithPhone = await this.userRepository.find({ where: { phone } });
      console.log('Users with this phone:', allUsersWithPhone.length);
      allUsersWithPhone.forEach(u => {
        console.log(`  - User ${u.id}: OTP=${u.otpCode}, Expires=${u.otpExpires}`);
      });
    }
    console.log('=========================');

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

    // Marquer comme vérifié et activer le compte
    await this.userRepository.update(user.id, {
      isVerified: true,
      status: UserStatus.ACTIVE, // Activer le compte lors de la vérification OTP
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

    // Normaliser les noms (supprimer les espaces)
    const normalizedFirstName = firstName?.trim() || '';
    const normalizedLastName = lastName?.trim() || '';

    console.log('=== DEBUG REGISTER ===');
    console.log('Phone:', phone);
    console.log('Normalized firstName:', normalizedFirstName);
    console.log('Normalized lastName:', normalizedLastName);
    console.log('Email:', email);
    console.log('======================');

    // Chercher un utilisateur existant par numéro de téléphone
    const existingUser = await this.userRepository.findOne({
      where: { phone }
    });

    console.log('Existing user found:', !!existingUser);
    if (existingUser) {
      console.log('Existing user status:', existingUser.status);
      console.log('Existing user firstName:', existingUser.firstName);
      console.log('Existing user lastName:', existingUser.lastName);
    }

    if (existingUser) {
      // Mettre à jour l'utilisateur existant avec les nouvelles données
      await this.userRepository.update(existingUser.id, {
        firstName: normalizedFirstName || existingUser.firstName,
        lastName: normalizedLastName || existingUser.lastName,
        email: email || existingUser.email,
        status: UserStatus.ACTIVE, // Activer le compte
        isVerified: true,
      });
      
      const updatedUser = await this.usersService.findOne(existingUser.id);
      
      console.log('User updated, status:', updatedUser.status);
      
      return {
        message: 'Compte activé avec succès',
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
      // Créer un nouvel utilisateur
      const newUser = await this.userRepository.save({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        phone,
        email,
        userType: UserType.CUSTOMER,
        status: UserStatus.ACTIVE,
        isVerified: true,
        otpAttempts: 3,
      });

      console.log('New user created, status:', newUser.status);

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

    console.log('=== DEBUG LOGIN ===');
    console.log('Phone:', phone);
    console.log('OTP Code:', otpCode);
    console.log('===================');

    // Trouver l'utilisateur avec le code OTP correspondant
    const user = await this.userRepository.findOne({
      where: { 
        phone, 
        otpCode 
      }
    });

    console.log('User found:', !!user);
    if (user) {
      console.log('User status:', user.status);
      console.log('User isVerified:', user.isVerified);
      console.log('OTP expires:', user.otpExpires);
      console.log('Current time:', new Date());
    }

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou code OTP invalide');
    }

    // Vérifier le code OTP
    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new UnauthorizedException('Code OTP expiré');
    }

    // Si le compte est inactif, l'activer automatiquement si le code OTP est valide
    if (user.status !== UserStatus.ACTIVE) {
      console.log('Compte inactif détecté, activation automatique...');
      await this.userRepository.update(user.id, {
        status: UserStatus.ACTIVE,
      });
    }

    // Nettoyer le code OTP et marquer comme connecté
    await this.userRepository.update(user.id, {
      otpCode: null,
      otpExpires: null,
      isOnline: true,
      lastLoginAt: new Date(),
    });

    console.log(`✅ Utilisateur ${user.firstName} ${user.lastName} connecté à ${new Date().toLocaleString('fr-FR')}`);

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

  async logout(userId: string): Promise<{ message: string }> {
    try {
      // Essayer d'abord de trouver un utilisateur classique (table users)
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (user) {
        await this.userRepository.update(user.id, {
          isOnline: false,
          lastLogoutAt: new Date(),
        });

        console.log('\n🚪 ===== DÉCONNEXION UTILISATEUR =====');
        console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName}`);
        console.log(`📞 Téléphone: ${user.phone}`);
        console.log(`⏰ Heure de déconnexion: ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🆔 ID utilisateur: ${user.id}`);
        console.log('=====================================\n');

        await this.displayAllUsersStatus();

        return { message: 'Déconnexion réussie' };
      }

      // Si aucun utilisateur classique, vérifier dans la table station_agents
      const stationAgent = await this.stationAgentRepository.findOne({ where: { id: userId } });
      if (stationAgent) {
        await this.stationAgentRepository.update(stationAgent.id, {
          isOnline: false,
          lastLogoutAt: new Date(),
        });

        console.log('\n🚪 ===== DÉCONNEXION AGENT DE GARE =====');
        console.log(`👤 Agent: ${stationAgent.firstName} ${stationAgent.lastName}`);
        console.log(`📞 Téléphone: ${stationAgent.phone}`);
        console.log(`⏰ Heure de déconnexion: ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🆔 ID agent: ${stationAgent.id}`);
        console.log('=====================================\n');

        return { message: 'Déconnexion réussie' };
      }

      throw new BadRequestException('Utilisateur non trouvé');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Utilisateur non trouvé');
      }
      throw error;
    }
  }

  async getAllUsersStatus(): Promise<{ 
    connectedUsers: Partial<User>[], 
    disconnectedUsers: Partial<User>[],
    stats: {
      totalUsers: number,
      connectedCount: number,
      disconnectedCount: number
    }
  }> {
    const allUsers = await this.userRepository.find({
      where: { status: UserStatus.ACTIVE },
      order: { lastLoginAt: 'DESC' }
    });

    const connectedUsers = allUsers
      .filter(user => user.isOnline)
      .map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        isOnline: user.isOnline,
        lastLoginAt: user.lastLoginAt,
        lastLogoutAt: user.lastLogoutAt,
      }));

    const disconnectedUsers = allUsers
      .filter(user => !user.isOnline)
      .map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        isOnline: user.isOnline,
        lastLoginAt: user.lastLoginAt,
        lastLogoutAt: user.lastLogoutAt,
      }));

    return {
      connectedUsers,
      disconnectedUsers,
      stats: {
        totalUsers: allUsers.length,
        connectedCount: connectedUsers.length,
        disconnectedCount: disconnectedUsers.length
      }
    };
  }

  private async displayAllUsersStatus(): Promise<void> {
    const usersStatus = await this.getAllUsersStatus();
    
    console.log('\n📊 ===== ÉTAT DES CONNEXIONS =====');
    console.log(`📈 Total utilisateurs: ${usersStatus.stats.totalUsers}`);
    console.log(`🟢 Connectés: ${usersStatus.stats.connectedCount}`);
    console.log(`🔴 Déconnectés: ${usersStatus.stats.disconnectedCount}`);
    
    if (usersStatus.connectedUsers.length > 0) {
      console.log('\n🟢 UTILISATEURS CONNECTÉS:');
      usersStatus.connectedUsers.forEach((user, index) => {
        const loginTime = user.lastLoginAt ? 
          new Date(user.lastLoginAt).toLocaleString('fr-FR') : 'Jamais';
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.phone})`);
        console.log(`      📅 Dernière connexion: ${loginTime}`);
      });
    }

    if (usersStatus.disconnectedUsers.length > 0) {
      console.log('\n🔴 UTILISATEURS DÉCONNECTÉS:');
      usersStatus.disconnectedUsers.slice(0, 10).forEach((user, index) => { // Limiter à 10 pour éviter le spam
        const logoutTime = user.lastLogoutAt ? 
          new Date(user.lastLogoutAt).toLocaleString('fr-FR') : 'Jamais';
        const loginTime = user.lastLoginAt ? 
          new Date(user.lastLoginAt).toLocaleString('fr-FR') : 'Jamais';
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.phone})`);
        console.log(`      📅 Dernière connexion: ${loginTime}`);
        console.log(`      🚪 Dernière déconnexion: ${logoutTime}`);
      });
      
      if (usersStatus.disconnectedUsers.length > 10) {
        console.log(`   ... et ${usersStatus.disconnectedUsers.length - 10} autres utilisateurs déconnectés`);
      }
    }
    
    console.log('==================================\n');
  }

  async createWorker(createWorkerDto: CreateWorkerDto): Promise<{ message: string; user: Partial<User> }> {
    const { firstName, lastName, phone, password, userType, email } = createWorkerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { phone }
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec ce numéro de téléphone existe déjà');
    }

    // Vérifier que le type est bien un type de travailleur
    if (userType === UserType.CUSTOMER) {
      throw new BadRequestException('Ce endpoint est réservé aux travailleurs (livreurs et agents)');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await this.userRepository.save({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      email: email?.trim(),
      password: hashedPassword,
      userType,
      status: UserStatus.ACTIVE,
      isVerified: true,
      isOnline: false,
    });

    console.log(`✅ Travailleur créé: ${newUser.firstName} ${newUser.lastName} (${newUser.phone}) - Type: ${newUser.userType}`);

    return {
      message: 'Travailleur créé avec succès',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        email: newUser.email,
        userType: newUser.userType,
        status: newUser.status,
      }
    };
  }

  async loginWorker(loginWorkerDto: { phone: string; password: string }): Promise<{ access_token: string; user: Partial<User> }> {
    const { phone, password } = loginWorkerDto;

    console.log('=== DEBUG LOGIN WORKER (Agent de gare) ===');
    console.log('Phone:', phone);
    console.log('=======================');

    // Trouver l'agent de gare par téléphone dans la table station_agents
    const agent = await this.stationAgentRepository.findOne({
      where: { phone }
    });

    // Si l'agent n'existe pas, retourner un message spécifique
    if (!agent) {
      throw new NotFoundException('Compte inexistant, veuillez contacter l\'admin');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Numéro ou mot de passe incorrect');
    }

    // Vérifier que le compte est actif
    if (!agent.isActive) {
      throw new UnauthorizedException('Votre compte est inactif. Contactez l\'administrateur.');
    }

    // Mettre à jour le statut de connexion dans station_agents
    await this.stationAgentRepository.update(agent.id, {
      isOnline: true,
      lastLoginAt: new Date(),
    });

    console.log(`✅ Agent de gare ${agent.firstName} ${agent.lastName} connecté à ${new Date().toLocaleString('fr-FR')}`);

    const payload = { sub: agent.id, phone: agent.phone, role: 'station_agent' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: agent.id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        phone: agent.phone,
        email: agent.email,
        userType: UserType.STATION_AGENT,
        isVerified: true,
      }
    };
  }

  async loginDriver(loginDriverDto: { phone: string; password: string }): Promise<{ access_token: string; driver: Partial<DeliveryPerson> }> {
    const { phone, password } = loginDriverDto;

    console.log('=== DEBUG LOGIN DRIVER ===');
    console.log('Phone:', phone);
    console.log('=======================');

    // Trouver le livreur par téléphone
    const driver = await this.deliveryPersonRepository.findOne({
      where: { phone },
    });

    // Si le livreur n'existe pas, retourner un message spécifique
    if (!driver) {
      throw new NotFoundException('Compte inexistant, veuillez contacter l\'admin');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, driver.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Numéro ou mot de passe incorrect');
    }

    // Vérifier que le compte est actif
    if (!driver.isActive) {
      throw new UnauthorizedException('Votre compte est inactif. Contactez l\'administrateur.');
    }

    // Mettre à jour le statut de connexion
    await this.deliveryPersonsService.updateOnlineStatus(driver.id, true);

    console.log(`✅ Livreur ${driver.firstName} ${driver.lastName} connecté à ${new Date().toLocaleString('fr-FR')}`);

    const payload = { sub: driver.id, phone: driver.phone, role: 'driver' };
    const access_token = this.jwtService.sign(payload);

    const updatedDriver = await this.deliveryPersonsService.findOne(driver.id);

    return {
      access_token,
      driver: {
        id: updatedDriver.id,
        firstName: updatedDriver.firstName,
        lastName: updatedDriver.lastName,
        phone: updatedDriver.phone,
        email: updatedDriver.email,
        isOnline: updatedDriver.isOnline,
        status: updatedDriver.status,
      }
    };
  }

  async logoutDriver(driverId: string): Promise<void> {
    await this.deliveryPersonsService.updateOnlineStatus(driverId, false);
    console.log(`✅ Livreur ${driverId} déconnecté à ${new Date().toLocaleString('fr-FR')}`);
  }
}