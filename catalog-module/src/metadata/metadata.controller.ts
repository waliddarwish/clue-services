import { Controller, Param, Body, Session, Get, Post } from '@nestjs/common';

import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { MetadataService } from './metadata.service';
import { ApiTags, ApiOperation, ApiParam, ApiProperty, ApiBody, ApiHeader } from '@nestjs/swagger';
import { ImportSpecObject } from '../../../object-schema/src/schemas/rbc.import-spec';

class ImportObjectsDTO {
  @ApiProperty({ type : [ImportSpecObject]})
  importSpecs : ImportSpecObject[]
  @ApiProperty({ description : 'An object of data sources with corressponding types' , example : '{ uuid1: "Dataset" , uuid2: "DatabaseConnection" }'})
  datasourceMap : any;
}
@Controller('metadata')
@ApiTags('Metadata')
@ApiHeader( { name : "passport" } )
export class MetadataController {

  constructor(
    private readonly globalizationService: GlobalizationService,
    private readonly metadataService: MetadataService,
  ) {}

  @Get(':connectionId/schema')
  @ApiOperation({summary: 'Returns schema for a given connection id'})
  @ApiParam({ name: 'connectionId', required: true, type: 'string' })
  async getSchemas(@Param('connectionId') connectionId, @Session() session): Promise<any> {
    return this.metadataService.getSchemas(connectionId, session.user.tenantId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '12001').then((theMessage: any): any => {
        return { status: 12001, message: theMessage, data: error };
      });
    });
  }


  @Get(':connectionId/:datasourceType/schema/:schemaName/objects')
  @ApiOperation({summary: 'Returns object for a given schema'})
  @ApiParam({ name: 'connectionId', required: true, type: 'string' })
  @ApiParam({ name: 'datasourceType', required: true, type: 'string' })
  @ApiParam({ name: 'schemaName', required: true, type: 'string' })
  async getDatabaseObjects(@Param('connectionId') connectionId, @Param('datasourceType') datasourceType ,  @Param('schemaName') schemaName , @Session() session): Promise<any> {
    return this.metadataService.getDatabaseObjects(connectionId , datasourceType , schemaName , session.user.tenantId ).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '12002').then((theMessage: any): any => {
        return { status: 12002, message: theMessage, data: error };
      });
    });
  }



  @Post(':modelId/import')
  @ApiOperation({summary: 'Imports database objects for a given model'})
  @ApiParam({ name: 'connectionId', required: true, type: 'string' })
  @ApiBody({ type : ImportObjectsDTO })
  async importModel(@Param('modelId') modelId, @Body() body: ImportObjectsDTO, @Session() session ): Promise<any> {
    return this.metadataService.importMetadata(modelId, body.importSpecs , body.datasourceMap , session.user.tenantId, session.user.id).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '12003').then((theMessage: any): any => {
        return { status: 12003, message: theMessage, data: error };
      });
    });
  }



  @Get('status/:trackingId')
  @ApiOperation({summary: 'Return the status of running import operation'})
  @ApiParam({ name: 'trackingId', required: true, type: 'string' })
  async importStatus(@Param('trackingId') trackingId ): Promise<any> {

    return this.metadataService.importStatus(trackingId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '12004').then((theMessage: any): any => {
        return { status: 12004, message: theMessage, data: error };
      });
    });
  }

  @Get('statusByModel/:modelId')
  @ApiOperation({summary: 'Return the status of running import operation by model id'})
  @ApiParam({ name: 'modelId', required: true, type: 'string' })
  async importStatusByModel(@Param('modelId') modelId): Promise<any> {
    return this.metadataService.importStatusByModel(modelId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '12005').then((theMessage: any): any => {
        return { status: 12005, message: theMessage, data: error };
      });
    });
  }


  @Get('collective-status/:modelId')
  @ApiOperation({summary: 'Return the overall status of running import operation by model id'})
  @ApiParam({ name: 'modelId', required: true, type: 'string' })
  async collectiveStatus(@Param('modelId') modelId): Promise<any> {
    return this.metadataService.collectiveStatus(modelId).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '12005').then((theMessage: any): any => {
        return { status: 12005, message: theMessage, data: error };
      });
    });
  }

}
