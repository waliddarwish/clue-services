import { Controller, Put, Req, Res } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('sa-logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Put('log')
  async log(@Req() req: FastifyRequest  , @Res() res: FastifyReply<any>): Promise<any> {
    this.loggerService.log(req.body).then((result) => {
      res.send({ status : 0 , message: 'Success'});
    });
  }

  @Put('clean-log')
  async cleanLog(@Req() req: FastifyRequest, @Res() res: FastifyReply<any>): Promise<any> {
    this.loggerService.cleanLogs(req.body.startDate, req.body.endDate).then((result) => {
      res.send({ status: 0, message: 'Success' });
    });
  }
}
