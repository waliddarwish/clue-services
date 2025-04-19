import { Controller, Get, Param, Body, Post, UseInterceptors } from '@nestjs/common';
import { AuthenticatorService } from './auth.service';

@Controller('auth')
export class AuthenticatorController {
  constructor(private readonly appService: AuthenticatorService) {}

  @Post('validate-password')
  async validatePassword(@Body() input: any): Promise<any> {
    return this.appService.validatePassword(
      input.password,
      input.salt,
      input.inpassword,
    );
  }
  @Post('hash-password')
  async hashPassword(@Body() body: any): Promise<string> {
    return this.appService.createPasswordHash(body.password, body.salt);
  }

  @Post('encrypt-rsa')
  async encryptRSA(@Body() body: any): Promise<string> {
    return this.appService.encryptRSAPublic(body.plainTextPassword);
  }
  @Post('decrypt-rsa')
  async decryptRSA(@Body() body: any): Promise<string> {
    return this.appService.decryptRSAPrivate(body.password);
  }
  @Post('create-hash')
  async createHash(@Body() body: any): Promise<string> {
    return this.appService.hashText(body.password, body.salt);
  }
}
