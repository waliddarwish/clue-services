import { Controller, Get, Put, Body } from '@nestjs/common';
import { QueryExecutorService } from './query-executor.service';

@Controller('query-executor')
export class QueryExecutorController {
  constructor(private readonly queryExecutorService: QueryExecutorService) { }

  @Put('execute-query')
  async generateQuery(@Body() body): Promise<any> {
    return this.queryExecutorService.executeQuery(body.queryString, body.connections, body.queryDefinition, body.models, body.datasets)
    .catch((error) => {
      return error;
    });
  }

}
