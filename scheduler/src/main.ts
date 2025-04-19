import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { SchedulerModule } from './scheduler.module';
import { SchedulerService } from './scheduler.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    SchedulerModule,
    new FastifyAdapter(),
  );
  app.get(SchedulerModule).register(app, 'scheduler' , app.get(SchedulerService) , true , 'tasks' , 'tasks-owner' , '4lzahraa2' , 'tasks').then(nodeConfig => {
      app
        .get(SchedulerModule)
        .configureAgenda(nodeConfig, app.get(SchedulerService))
        .catch(error => {
          console.log(error);
        });
    });

}
bootstrap();
