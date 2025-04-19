import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { GlobalizerModule } from './globalizer.module';
import { GlobalizerService } from './globalizer.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    GlobalizerModule,
    new FastifyAdapter(),
  );
  app.get(GlobalizerModule).register(app, 'globalizer' , app.get(GlobalizerService) , true , 'global' , 'global-owner' , '4lzahraa2' , 'global');
}
bootstrap();
