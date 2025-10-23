import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000', 
      'http://localhost:19006',
      'http://10.0.2.2:3000',  // Émulateur Android
      'http://10.0.2.2:19006', // Émulateur Android Expo
      'http://192.168.1.17:3000', // IP locale pour Expo Go
      'http://192.168.1.17:19006', // IP locale pour Expo Go
      'http://192.168.1.100:3000', // IP locale alternative
      'http://192.168.1.100:19006'  // IP locale alternative
    ],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Configuration de validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('PAKO API')
    .setDescription('API pour le service de livraison PAKO')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  
  console.log(`🚀 Application PAKO démarrée sur ${host}:${port}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${port}/api`);
}

bootstrap();