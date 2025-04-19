import { Module, HttpModule } from '@nestjs/common';
import { MailerController } from './mailer.controller';
import { AppMailerService } from './mailer.service';
import { AppModule } from '../../app-module/src/app.module';
import nodemailer = require('nodemailer');
import smtpTransport = require('nodemailer-smtp-transport');
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';

@Module({
  imports: [HttpModule],
  controllers: [MailerController],
  providers: [AppMailerService, LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },],
})
export class AppMailerModule extends AppModule {
  async configureMail(nodeConfig: any, mailerService: AppMailerService): Promise<any> {

    const transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
        user: nodeConfig.mailOptions.sourceEmail,
        pass: nodeConfig.mailOptions.password,
      },
    }));
    mailerService.setTransporter(transporter);
    mailerService.setSourceEmail(nodeConfig.mailOptions.sourceEmail);

  }

}
