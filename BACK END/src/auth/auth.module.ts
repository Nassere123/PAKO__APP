import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';
import { StationAgent } from '../station-agents/entities/station-agent.entity';
import { UsersModule } from '../users/users.module';
import { DeliveryPersonsModule } from '../delivery-persons/delivery-persons.module';
import { StationAgentsModule } from '../station-agents/station-agents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeliveryPerson, StationAgent]),
    UsersModule,
    DeliveryPersonsModule,
    StationAgentsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h'
        } as any,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}