import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    LoggerModule,
    new FastifyAdapter(),
  );
  app.get(LoggerModule).register(app, 'logger' , app.get(LoggerService) , true, 'logs' , 'logs-owner' , '4lzahraa2' , 'logs');
}
bootstrap();
