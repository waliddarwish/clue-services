import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppMailerService } from './mailer.service';

@Controller('mail')
export class MailerController {
  constructor(private readonly appService: AppMailerService) {}

  @Post('send')
  async sendMail(@Body() params): Promise<any> {
    this.appService.sendMail(params.targetEmail, params.template, params.context).then( () => {
      return { status : 0 , message: 'Success'};
    }).catch( (error) => {
      return {status: 1013 , message: error};
    });
  }
}
