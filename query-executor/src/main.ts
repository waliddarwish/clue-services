import { NestFactory } from '@nestjs/core';
import { QueryExecutorModule } from './query-executor.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    QueryExecutorModule,
    new FastifyAdapter(),
  );
  app.get(QueryExecutorModule).register(app, 'query-executor' , false);
}
bootstrap();
