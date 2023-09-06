import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    cert: fs.readFileSync('./secret/fullchain.pem'),
    key: fs.readFileSync('./secret/ssl_keychain.pem'),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    cors: true,
  });


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    validationError: { value: false },
    transform: true,
  }));

  app.use('/avatar', express.static(join(process.cwd(), 'avatar')));
  await app.listen(5400);
}
bootstrap();
