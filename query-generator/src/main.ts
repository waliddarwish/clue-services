import { NestFactory } from '@nestjs/core';
import { QueryGeneratorModule } from './query-generator.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { QueryGeneratorService } from './query-generator.service';

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    QueryGeneratorModule,
    new FastifyAdapter(),
  );
  app.get(QueryGeneratorModule).register(app, 'query-generator', app.get(QueryGeneratorService), false);

}
bootstrap();
