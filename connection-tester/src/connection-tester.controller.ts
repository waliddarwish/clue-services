import { Controller, Body, Post } from '@nestjs/common';
import { ConnectionTesterService } from './connection-tester.service';

@Controller('connection-test')
export class ConnectionTesterController {
  constructor(private readonly testConnectionService: ConnectionTesterService) {}

  @Post()
  async testConnection(@Body() body): Promise<any> {
    return this.testConnectionService.testConnection(body);
  }

}
