import 'dotenv/config'; // Debe ir primero: carga JWT_SECRET y demás variables del .env
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Imágenes subidas (media.service.ts guarda en ./uploads y devuelve /uploads/<archivo>)
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  Logger.log(`Backend running on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();