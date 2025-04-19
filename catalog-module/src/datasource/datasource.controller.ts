import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { Controller, Put, Body, Session, Param, Get, Delete, Post } from '@nestjs/common';
import { DatasourceService } from './datasource.service';
import { ApiOperation, ApiParam, ApiTags, ApiHeader } from '@nestjs/swagger';

@Controller('datasource')
@ApiTags('Datasources')
@ApiHeader( { name : "passport" } )
export class DatasourceController {
    constructor(private readonly datasetService: DatasourceService ,
                private readonly globalizationService: GlobalizationService) { }


    @Get('/:searchText/:databaseLimit/:datasetLimit')
    @ApiOperation({ summary: "Returns datasets and database connection for a tenant based on the search test"})
    @ApiParam({ name: 'searchText', required: true, type: 'string' })
    @ApiParam({ name: 'databaseLimit', required: true, type: 'string' })
    @ApiParam({ name: 'datasetLimit', required: true, type: 'string' })
    async findDatasets(@Param() params, @Session() session): Promise<any> {
        return this.datasetService.getDatasources(params.searchText , session.user, params.databaseLimit , params.datasetLimit).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '20002').then((theMessage: any): any => {
                return { status: 20002, message: theMessage, data: error };
            });
        });
    }

    @Get('/models/:searchText/:datasetLimit/:modelLimit')
    @Get('/:searchText/:databaseLimit/:datasetLimit')
    @ApiOperation({ summary: "Returns datasets and models for a tenant based on the search test"})
    @ApiParam({ name: 'searchText', required: true, type: 'string' })
    @ApiParam({ name: 'datasetLimit', required: true, type: 'string' })
    @ApiParam({ name: 'modelLimit', required: true, type: 'string' })
    async findModelSources(@Param() params, @Session() session): Promise<any> {
        return this.datasetService.getModelSources(params.searchText , session.user, params.datasetLimit , params.modelLimit).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '20002').then((theMessage: any): any => {
                return { status: 20002, message: theMessage, data: error };
            });
        });
    }

}
