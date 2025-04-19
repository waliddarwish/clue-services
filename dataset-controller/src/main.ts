import { NestFactory } from '@nestjs/core';
import { DatasetCtrlModule } from './dataset-ctrl.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    DatasetCtrlModule,
    new FastifyAdapter(),
  );
  app.get(DatasetCtrlModule).register(app, 'dataset-controller', false);

}

bootstrap();
