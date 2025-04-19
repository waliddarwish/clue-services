import { Controller, Body, Post, Put, Param } from '@nestjs/common';
import { MetadataImporterService } from './metadata-importer.service';

@Controller('metadata-importer')
export class MetadataImporterController {
  constructor(private readonly metadataImporterService: MetadataImporterService) { }

  @Put('import-objects/:tenantId/:userId/:modelId/:trackerId')
  async importObject(@Param('tenantId') tenantId, @Param('userId') userId,
                     @Param('trackerId') trackerId, @Param('modelId') modelId, @Body() body ): Promise<any> {
    return this.metadataImporterService.importObject(tenantId, userId, trackerId, modelId, body.objects, body.connection );

  }

}
