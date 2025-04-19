import { Controller, Put, Body, Session, Get, Param, Delete, Post } from "@nestjs/common";
import { VisualizationPageService } from './visualization-page.service';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from "@nestjs/swagger";
import { VisualizationPageObject } from "../../../object-schema/src/schemas/catalog.visualization-page";

@Controller('clue')
@ApiTags('Visualizations')
@ApiHeader( { name : "passport" } )
export class VisualizationPageController {

    constructor(private readonly VisualizationPageService: VisualizationPageService,
        private readonly globalizationService: GlobalizationService) { }

    @Put('visualization-page')
    @ApiOperation({ summary : 'Creates a visualization page' })
    @ApiBody({ type: VisualizationPageObject })
    async createVisualizationPage(@Body() reqBody: VisualizationPageObject , @Session() session): Promise<any> {
        return this.VisualizationPageService.createVisualizationPage(reqBody, session.user.id, session.user.tenantId).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '22001');
            return { status: 22001, message: theMessage, data: error };
        });
    }

    @Get('visualization-page/:id')
    @ApiOperation({ summary : 'Finds a visualization page by Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisualizationPageById(@Param() params): Promise<any> {
        return this.VisualizationPageService.findVisualizationPageById(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '22002');
            return { status: 22002, message: theMessage, data: error };
        });
    }

    @Get('visualization-page/user/:id')
    @ApiOperation({ summary : 'Finds a visualization pages by user Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisualizationPageByUserId(@Param() params): Promise<any> {
        return this.VisualizationPageService.findVisualizationPageByUserId(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '22003');
            return { status: 22003, message: theMessage, data: error };
        });
    }

    @Get('visualization-page/tenant/:id')
    @ApiOperation({ summary : 'Finds a visualization tenant by Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisualizationPageByTenantId(@Param() params): Promise<any> {
        return this.VisualizationPageService.findVisualizationPageByTenantId(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '22004');
            return { status: 22004, message: theMessage, data: error };
        });
    }

    @Delete('visualization-page/:id')
    @ApiOperation({ summary : 'Deletes a visualization page' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteVisualizationPageById(@Param() params): Promise<any> {
        return this.VisualizationPageService.deleteVisualizationPage(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '22005');
            return { status: 22005, message: theMessage, data: error };
        });
    }

    @Put('visualization-page/:id')
    @ApiOperation({ summary : 'Updates a visualization page' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async updateVisualizationPage(@Param() params, @Body() body, @Session() session): Promise<any> {
        return this.VisualizationPageService.updateVisualizationPage(params.id, body, session.user.id, session.user.tenantId).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '22006');
            return { status: 22006, message: theMessage, data: error };
        });
    }
}