import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';

import { AppModule } from './app.module';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jsonBodyMiddleware = express.json();

  app.use(jsonBodyMiddleware);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.use('/static', express.static(path.resolve(__dirname, '..', 'static')));
  app.use(cors({ credentials: true }));

  await app.listen(port, () => {
    console.log(`This app listening on port ${port}`);
  });
}
bootstrap();
