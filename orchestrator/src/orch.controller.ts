import { Controller, Put, Req, Get, Param, Res, Body } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { OrchService } from './orch.service';
import { LogService } from '../../log-module/src/log.service';
import supportedLanguages from '../static-data/supported-languages.json';
import { ApiOperation, ApiTags, ApiCookieAuth } from '@nestjs/swagger';

@Controller('orchestrator')
@ApiTags('Sessions')
export class OrchController {
  constructor(
      private readonly orchService: OrchService,
      private readonly logService: LogService) {
  }

  @Get('test-session1')
  @ApiOperation({ summary : 'Test session ceation...' })
  async testSession1(@Req() req: FastifyRequest, @Res() res: FastifyReply<any>): Promise<any> {
    const session = req.session;
    session.count = 1;
    res.send(session);
  }


  @Get('test-session2')
  async testSession2(@Req() req: FastifyRequest, @Res() res: FastifyReply<any>): Promise<any> {
    const session = req.session;
    session.count++;
    res.send(session);
  }

  @Get('language')
  @ApiOperation({ summary : 'Retrieve the server supported languages' })
  async getSupportedLanguages(): Promise<any> {
      return { status: 0, message: 'Success', data: supportedLanguages };
  }
}
