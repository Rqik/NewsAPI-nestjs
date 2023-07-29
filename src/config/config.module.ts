import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configSchema from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: configSchema,
    }),
  ],
})
export class AppConfigModule {}
