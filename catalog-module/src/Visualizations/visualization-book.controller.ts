import { Controller, Put, Body, Session, Get, Param, Delete, Post } from "@nestjs/common";
import { VisualizationBookService } from './visualization-book.service';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from "@nestjs/swagger";
import { VisualizationBookObject } from "../../../object-schema//src/schemas/catalog.visualization-book";

@Controller('clue')
@ApiTags('Visualizations')
@ApiHeader( { name : "passport" } )
export class VisualizationBookController {

    constructor(private readonly VisualizationBookService: VisualizationBookService,
        private readonly globalizationService: GlobalizationService) { }

    @Put('visualization-book')
    @ApiOperation({ summary : 'Creates a visualization book' })
    @ApiBody({ type: VisualizationBookObject })
    async createVisualizationBook(@Body() reqBody: VisualizationBookObject, @Session() session): Promise<any> {
        return this.VisualizationBookService.createVisualizationBook(reqBody, session.user.id, session.user.tenantId).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21001');
            return { status: 21001, message: theMessage, data: error };
        });
    }

    @Get('visualization-book/:id')
    @ApiOperation({ summary : 'Finds a visualization book' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisualizationBookById(@Param() params): Promise<any> {
        return this.VisualizationBookService.findVisualizationBookById(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21002');
            return { status: 21002, message: theMessage, data: error };
        });
    }

    @Get('visualization-book/:id/vispage')
    @ApiOperation({ summary : 'Finds visualization pages by visualization book id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisPagesByVizBookId(@Param() params): Promise<any> {
        return this.VisualizationBookService.findVisPagesByVizBookId(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21003');
            return { status: 21003, message: theMessage, data: error };
        });
    }

    @Get('visualization-book/:bookId/vispage/:id')
    @ApiOperation({ summary : 'Finds a visualization page by id in a visualization book' })
    @ApiParam({ name: 'bookId', required: true, type: 'string' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisPageByVizBookId(@Param() params): Promise<any> {
        return this.VisualizationBookService.findVisPageByVizBookId(params.bookId, params.pageId).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21004');
            return { status: 21004, message: theMessage, data: error };
        });
    }

    @Get('visualization-book/user/:id')
    @ApiOperation({ summary : 'Finds a visualization books by user id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisualizationBookByUserId(@Param() params): Promise<any> {
        return this.VisualizationBookService.findVisualizationBookByUserId(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21005');
            return { status: 21005, message: theMessage, data: error };
        });
    }

    @Get('visualization-book/tenant/:id')
    @ApiOperation({ summary : 'Finds a visualization books by tenant id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findVisualizationBookByTenantId(@Param() params): Promise<any> {
        return this.VisualizationBookService.findVisualizationBookByTenantId(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21006');
            return { status: 21006, message: theMessage, data: error };
        });
    }

    @Delete('visualization-book/:id')
    @ApiOperation({ summary : 'Deletes a visualization book by id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteVisualizationBookById(@Param() params): Promise<any> {
        return this.VisualizationBookService.deleteVisualizationBook(params.id).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21007');
            return { status: 21007, message: theMessage, data: error };
        });
    }

    @Put('visualization-book/:id')
    @ApiOperation({ summary : 'Updates a visualization book' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async updateVisualizationBook(@Param() params, @Body() body: VisualizationBookObject): Promise<any> {
        return this.VisualizationBookService.updateVisualizationBook(params.id, body).then(async (result) => {
            const theMessage = await this.globalizationService.get('en', 'Success');
            return { status: 0, message: theMessage, data: result };
        }).catch(async (error) => {
            const theMessage = await this.globalizationService.get('en', '21008');
            return { status: 21008, message: theMessage, data: error };
        });
    }

    @Get('visualization-book/recent/:count')
    @ApiOperation({ summary : 'Returns recent visualization books' })
    @ApiParam({ name: 'count', required: true, type: 'string' })
    async getRecentVisualizationBooks(@Param() params: any, @Session() session): Promise<any> {
        return this.VisualizationBookService.getRecentVizByTenantId(+params.count, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '21009').then((theMessage: any): any => {
                return { status: 21009, message: theMessage, data: error };
            });
        });
    }
}