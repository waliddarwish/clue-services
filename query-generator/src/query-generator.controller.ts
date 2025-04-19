import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { QueryGeneratorService } from './query-generator.service';

@Controller('query-generator')
export class QueryGeneratorController {
  constructor(private readonly queryGeneratorService: QueryGeneratorService) { }

  @Put('generate-query')
  async generateQuery(@Body() body): Promise<any> {
    console.log("Query-Generator: Controller: generateQuery: ");
    return this.queryGeneratorService.generateQuery(body.queryDefinition, body.models, body.connections, body.datasets);
  }

  @Put('generate-model-graph')
  async getGraphByModel(@Body() body): Promise<any> {
    return this.queryGeneratorService.generateGraphByModelId(body.modelId);
  }
  @Put('graph-for-model-objects')
  async getGraphByModelObject(@Body() body): Promise<any> {
    return this.queryGeneratorService.generateGraphByModelObjectIds(body.modelObjectIds);
  }
}
