import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { Controller, Put, Body, Session, Param, Get, Delete, Post } from '@nestjs/common';
import { DataSourceConnectionService } from './connection.service';
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';
import { DataSourceConnectionObject, DataSourceConnectionObjectDTO } from '../../../object-schema/src/schemas/catalog.connection';

@Controller('connection')
@ApiTags('Connections')
@ApiHeader( { name : "passport" } )
export class ConnectionController {
    constructor(private readonly dsConnectionService: DataSourceConnectionService ,
                private readonly globalizationService: GlobalizationService) { }

    @Put()
    @ApiOperation({ summary: "Create a datasource connection"})
    @ApiBody({ type: DataSourceConnectionObject })
    async createDataSourceConnection(@Body() reqBody: DataSourceConnectionObject , @Session() session): Promise<any> {
        return this.dsConnectionService.createDataSourceConnection(reqBody, session.user.id , session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3001').then((theMessage: any): any => {
                return { status: 3001, message: theMessage, data: error };
            });
        });
    }

    @Get(':id')
    @ApiOperation({ summary: "Find a datasource connection"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findDataSourceConnectionById(@Param() params): Promise<any> {
        return this.dsConnectionService.findDataSourceConnectionById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3002').then((theMessage: any): any => {
                return { status: 3002, message: theMessage, data: error };
            });
        });
    }

    @Delete(':id')
    @ApiOperation({ summary: "Delete a datasource connection"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteConnectionById(@Param() params): Promise<any> {
        return this.dsConnectionService.deleteConnectionById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3003').then((theMessage: any): any => {
                return { status: 3003, message: theMessage, data: error };
            });
        });
    }

    @Delete()
    @ApiOperation({ summary: "Find datasource connections for current user"})
    async deleteConnections(@Session() session): Promise<any> {
        return this.dsConnectionService.deleteConnections(session.user.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: null };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3003').then((theMessage: any): any => {
                return { status: 3003, message: theMessage, data: error };
            });
        });
    }

    @Post(':id')
    @ApiOperation({ summary: "Updates a datsource connection"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiBody({ type: DataSourceConnectionObjectDTO  })
    async updateConnection(@Param() params, @Body() body : DataSourceConnectionObjectDTO ): Promise<any> {
        return this.dsConnectionService.updateConnection(params.id, body).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3004').then((theMessage: any): any => {
                return { status: 3004, message: theMessage, data: error };
            });
        });
    }

    @Get('/user/:id')
    @ApiOperation({ summary: "Find datasource connections for a user"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findConnectionsByUser(@Param() params): Promise<any> {
        return this.dsConnectionService.findDataSourceConnectionByUserId(params.id).then( (result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3005').then((theMessage: any): any => {
                return { status: 3005, message: theMessage, data: error };
            });
        });
    }

    @Get()
    @ApiOperation({ summary: "Find datasource connections for a tenant"})
    async findConnectionsByTenant(@Session() session): Promise<any> {
        return this.dsConnectionService.findDataSourceConnectionByTenantId(session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3006').then((theMessage: any): any => {
                return { status: 3006, message: theMessage, data: error };
            });
        });
    }

    @Get('search/:searchText')
    @ApiOperation({ summary: "Search for  datasource connections"})
    @ApiParam({ name: 'searchText', required: true, type: 'string' })
    async searchDataSourceConnections(@Param() params, @Session() session): Promise<any> {
        return this.dsConnectionService.searchDataSourceConnection(params.searchText, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3007').then((theMessage: any): any => {
                return { status: 3007, message: theMessage, data: error };
            });
        });
    }

    @Post('test')
    @ApiOperation({ summary: "Test a datasource connection defintion"})
    async testDataSourceConnection(@Body() body: DataSourceConnectionObject, @Session() session): Promise<any> {
        return this.dsConnectionService.testDataSourceConnection(body).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3010').then((theMessage: any): any => {
                return { status: 3010, message: theMessage, data: error };
            });
        });
    }

    @Get('test/:id')
    @ApiOperation({ summary: "Test a datasource connection by a givin Id"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async testDataSourceConnectionById(@Param() params): Promise<any> {
        return this.dsConnectionService.testDataSourceConnectionById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3010').then((theMessage: any): any => {
                return { status: 3010, message: theMessage, data: error };
            });
        });
    }


    @Get('recent/:count')
    @ApiOperation({ summary: "Returns recent datasource connections"})
    @ApiParam({ name: 'count', required: true, type: 'string' })
    async getRecentConnections( @Param() params: any , @Session() session): Promise<any> {
        return this.dsConnectionService.getRecentConnections(+params.count, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3011').then((theMessage: any): any => {
                return { status: 3011, message: theMessage, data: error };
            });
        });
    }

}
