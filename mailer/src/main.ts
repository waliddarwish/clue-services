import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppMailerModule } from './mailer.module';
import { AppMailerService } from './mailer.service';
import { Logger } from '@nestjs/common';
let logger = new Logger('Mailer');
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppMailerModule,
    new FastifyAdapter(),
  );
  app.get(AppMailerModule).register(app, 'mailer' ).then((nodeConfig) => {
    app.get(AppMailerModule).configureMail(nodeConfig , app.get(AppMailerService)).catch( (error) => {
      // tslint:disable-next-line: no-console
      logger.error(error);
    });
  });
}
bootstrap();
