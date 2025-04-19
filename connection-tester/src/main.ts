import { NestFactory } from '@nestjs/core';
import { ConnectionTesterModule } from './connection-tester.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    ConnectionTesterModule,
    new FastifyAdapter(),
  );
  app.get(ConnectionTesterModule).register(app, 'connection-tester', false);

}

bootstrap();
