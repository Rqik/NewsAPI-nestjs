import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { AllExceptionsFilter, loggerMiddleware } from '@/middleware';

import { AppModule } from './app.module';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jsonBodyMiddleware = express.json();
  app.setGlobalPrefix('api/v1');
  app.use(jsonBodyMiddleware);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  // app.use('/static', express.static(path.resolve(__dirname, '..', 'static')));
  app.use(cors({ credentials: true }));
  app.use(loggerMiddleware);
  await app.listen(port, () => {
    console.log(`This app listening on port ${port}`);
  });
}
bootstrap();
