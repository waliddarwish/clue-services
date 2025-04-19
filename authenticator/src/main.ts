import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthenticatorModule } from './auth.module';

import cryptography = require('cryptography');

async function bootstrap() {
  cryptography.defaults.key = 'password';
  cryptography.defaults.encryptionAlgorithm = 'aes192';
  cryptography.defaults.encoding = 'hex';

  const app = await NestFactory.create<NestFastifyApplication>(
    AuthenticatorModule,
    new FastifyAdapter(),
  );
  app.get(AuthenticatorModule).register(app, 'authenticator'  , false);
}
bootstrap();
