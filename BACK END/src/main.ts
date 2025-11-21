import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS - Autoriser toutes les origines localhost en développement
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:8081', // Expo web dev server (port par défaut)
    'http://localhost:19006', // Expo web alternative port
    'http://localhost:19000', // Expo dev tools
    'http://localhost:3000', // Backend port (pour les tests)
      'http://10.0.2.2:3000',  // Émulateur Android
      'http://10.0.2.2:19006', // Émulateur Android Expo
      'http://192.168.1.5:3000', // IP Wi-Fi actuelle
      'http://192.168.1.5:19006', // IP Wi-Fi actuelle Expo
      'http://192.168.1.17:3000', // IP locale pour Expo Go
      'http://192.168.1.17:19006', // IP locale pour Expo Go
      'http://192.168.1.35:3000', // IP locale précédente (client)
      'http://192.168.1.35:19006', // IP locale précédente Expo (client)
      'http://192.168.1.3:3000', // IP locale actuelle - carte réseau sans fil (client)
      'http://192.168.1.3:19006', // IP locale actuelle Expo - carte réseau sans fil (client)
      'http://192.168.1.10:3000', // IP locale principale détectée
      'http://192.168.1.10:19006', // IP locale principale Expo
      'http://192.168.1.49:3000', // IP locale actuelle - carte réseau sans fil (client)
      'http://192.168.1.49:19006', // IP locale actuelle Expo - carte réseau sans fil (client)
      'http://192.168.1.100:3000', // IP locale alternative
      'http://192.168.1.100:19006', // IP locale alternative
      'http://192.168.190.1:3000', // IP locale actuelle
      'http://192.168.190.1:19006', // IP locale actuelle
      'http://10.75.75.32:3000', // IP du téléphone hotspot
      'http://10.75.75.32:19006', // IP du téléphone hotspot
      'http://192.168.43.1:3000', // IP hotspot Android
      'http://192.168.43.1:19006', // IP hotspot Android
      'http://192.168.137.1:3000', // IP hotspot Windows
      'http://192.168.137.1:19006' // IP hotspot Windows
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // En développement, autoriser toutes les origines localhost et 127.0.0.1
      if (!origin || 
          origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:') ||
          allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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