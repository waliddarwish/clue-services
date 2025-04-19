import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MetadataCoordinator } from './metadata-coordinator.module';

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    MetadataCoordinator,
    new FastifyAdapter(),
  );
  app.get(MetadataCoordinator).register(app, 'metadata-coordinator', false);
}
bootstrap();
