import { NestFactory } from '@nestjs/core';
import { MetadataImporter } from './metadata-importer.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    MetadataImporter,
    new FastifyAdapter(),
  );
  app.get(MetadataImporter).register(app, 'metadata-importer' , false);
}
bootstrap();
