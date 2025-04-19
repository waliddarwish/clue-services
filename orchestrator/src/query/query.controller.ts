import { Controller, Put, Body, Get, Param } from "@nestjs/common";
import { QueryService } from './query.service';
import { GlobalizationService } from "../../../globalization-module/src/globalization.service";
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { QueryDefinition } from "../../../object-schema/src/schemas/query-definition";

@Controller('query')
@ApiTags('Queries')
@ApiHeader( { name : "passport" } )
export class QueryController {

    constructor(private readonly queryService: QueryService,
        private readonly globalizationService: GlobalizationService,
    ) {

    }
    @Put()
    @ApiOperation({summary: 'runs a query'})
    @ApiBody({ type: QueryDefinition })
    async handleQuery(@Body() body: QueryDefinition): Promise<any> {
        return this.queryService.handleQuery(body).then((result) => {
            return result;
        }).catch((error) => {
            console.log(error);
            return this.globalizationService.get('en', '15005').then((theMessage: any): any => {
                return { status: 15005, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }

    @Put('handle-test-data')
    async handleTestData(@Body() body): Promise<any> {
        return this.queryService.handleTestData(body.connections, body.models, body.modelObjs, body.forDelete).then((result) => {
            return result;
        }).catch((error) => {
            return this.globalizationService.get('en', '15005').then((theMessage: any): any => {
                return { status: 15005, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }

    @Get('generate-model-graph/:modelId')
    @ApiOperation({summary : 'Retrieve model graph'})
    @ApiParam({ name: 'modelId', required: true, type: 'string' })
    async getGraphByModelId(@Param() param): Promise<any> {
        return this.queryService.generateGraphByModelId(param.modelId).then((result) => {
            return result;
        }).catch((error) => {
            return this.globalizationService.get('en', '15006').then((theMessage: any): any => {
                return { status: 15006, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }
    @Put('graph-for-model-objects')
    @ApiOperation({summary: 'Retreive model graph for object'})
    async getGraphByModelObjectIds(@Body() body): Promise<any> {
        return this.queryService.generateGraphByModelObjectIds(body.modelObjectIds).then((result) => {
            return result;
        }).catch((error) => {
            return this.globalizationService.get('en', '15007').then((theMessage: any): any => {
                return { status: 15007, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }

}