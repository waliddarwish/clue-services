import { Controller, Body, Get, Post, Param, Session } from '@nestjs/common';
import { MetadataCoordinatorService } from './metadata-coordinator.service';

@Controller('metadata-coordinator')
export class MetadataCoordinatorController {
  constructor(private readonly metadataCoordinatorService: MetadataCoordinatorService) { }

  @Post('schemas')
  async getSchemas(@Body() connection): Promise<any> {
    return this.metadataCoordinatorService.getSchemas(connection);
  }

  @Post(':schemaName/objects')
  async getSchemaObjects(@Param('schemaName') schemaName, @Body() connection): Promise<any> {
    return this.metadataCoordinatorService.getSchemaObjects(connection, schemaName);
  }

  @Post('import/:trackingId/:tenantId/:userId')
  async importModel(@Param('trackingId') trackingId, @Param('tenantId') tenantId, @Param('userId') userId, @Body() importData): Promise<any> {
    return this.metadataCoordinatorService.importModel(importData.model, importData.importSpecs, userId, tenantId, trackingId);
  }
}
