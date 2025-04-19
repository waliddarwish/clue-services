import {Controller, Put, Body, Session, Get, Param, Delete, Post} from "@nestjs/common";
import { ClueModelService } from './model.service';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiHeader } from "@nestjs/swagger";
import { ClueModelEntryDTO } from "../../../object-schema/src/schemas/catalog.model";
import { ClueModelObjectEntry } from "../../../object-schema/src/schemas/catalog.model-object";



@Controller('clue')
@ApiTags('Models')
@ApiHeader( { name : "passport" } )
export class ClueModelController {

    constructor(private readonly clueModelService: ClueModelService,
                private readonly globalizationService: GlobalizationService) {}

    @Put('model')
    @ApiOperation({ summary: 'Creates a model'})
    @ApiBody({ type: ClueModelEntryDTO })
    async createClueModel(@Body() reqBody: ClueModelEntryDTO, @Session() session): Promise<any> {
        return this.clueModelService.createClueModel(reqBody, session.user.id, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7001').then((theMessage: any): any => {
                return { status: 7001, message: theMessage, data: error };
            });
        });
    }

    @Get('model/:id')
    @ApiOperation({ summary: 'Returns a model by Id'})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelById(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7002').then((theMessage: any): any => {
                return { status: 7002, message: theMessage, data: error };
            });
        });
    }

    @Get('model/user/:id')
    @ApiOperation({ summary: 'Return models by user Id'})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelByUserId(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelByUserId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7002').then((theMessage: any): any => {
                return { status: 7002, message: theMessage, data: error };
            });
        });
    }

    // This function should read the tenant from the session, passing tenant id is a security issue
    @Get('model/tenant/:id')
    @ApiOperation({ summary: 'Return models by tenant Id'})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelByTenantId(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelByTenantId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7002').then((theMessage: any): any => {
                return { status: 7002, message: theMessage, data: error };
            });
        });
    }


    @Delete('model/:id')
    @ApiOperation({ summary: 'Deletes a model'})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteClueModelById(@Param() params): Promise<any> {
        return this.clueModelService.deleteModel(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7003').then((theMessage: any): any => {
                return { status: 7003, message: theMessage, data: error };
            });
        });
    }

    @Post('model/:id')
    @ApiOperation({ summary: 'Updates a model'})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiBody({ type : ClueModelEntryDTO })
    async updateClueModel(@Param() params, @Body() body: ClueModelEntryDTO): Promise<any> {
        return this.clueModelService.updateClueModel(params.id, body).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7004').then((theMessage: any): any => {
                return { status: 7004, message: theMessage, data: error };
            });
        });
    }

    @Put('model-obj')
    @ApiOperation({ summary: 'Creates a model object'})
    @ApiBody({ type: ClueModelObjectEntry })
    async createClueModelObject(@Body() reqBody: ClueModelObjectEntry, @Session() session): Promise<any> {
        return this.clueModelService.createClueModelObject(reqBody, session.user.id, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7051').then((theMessage: any): any => {
                return { status: 7051, message: theMessage, data: error };
            });
        });
    }

    @Post('model-obj/:modelObjectId')
    @ApiOperation({ summary: 'Updates model object'})
    @ApiBody({ type : ClueModelObjectEntry })
    async updateClueModelObject(@Param() param, @Body() reqBody: ClueModelObjectEntry, @Session() session): Promise<any> {
        return this.clueModelService.updateClueModelObject(param.modelObjectId , reqBody).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7054').then((theMessage: any): any => {
                return { status: 7054, message: theMessage, data: error };
            });
        });
    }

    @Get('model-obj/:id')
    @ApiOperation({ summary : 'Find model object by Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelObjectById(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelObjectById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7052').then((theMessage: any): any => {
                return { status: 7052, message: theMessage, data: error };
            });
        });
    }

    @Get('model-obj/user/:id')
    @ApiOperation({ summary : 'Find model objects by user Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelObjectByUserId(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelObjectByUserId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7052').then((theMessage: any): any => {
                return { status: 7052, message: theMessage, data: error };
            });
        });
    }

    @Get('model-obj/tenant/:id')
    @ApiOperation({ summary : 'Find model object by tenant Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelObjectByTenantId(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelObjectByTenantId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7052').then((theMessage: any): any => {
                return { status: 7052, message: theMessage, data: error };
            });
        });
    }

    @Get('model-obj/conn/:id')
    @ApiOperation({ summary : 'Find model object by connection Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelObjectByConnectionId(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelObjectByConnectionId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7052').then((theMessage: any): any => {
                return { status: 7052, message: theMessage, data: error };
            });
        });
    }

    @Get('model-obj/model/:id')
    @ApiOperation({ summary : 'Find model object by model Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findClueModelObjectByModelId(@Param() params): Promise<any> {
        return this.clueModelService.findClueModelObjectByModelId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7052').then((theMessage: any): any => {
                return { status: 7052, message: theMessage, data: error };
            });
        });
    }

    @Delete('model-obj/:id')
    @ApiOperation({ summary : 'Delete model object by Id' })
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteClueModelObjectById(@Param() params): Promise<any> {
        return this.clueModelService.deleteModelObject(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7053').then((theMessage: any): any => {
                return { status: 7053, message: theMessage, data: error };
            });
        });
    }

    @Get('model/tenant/recent/:count')
    @ApiOperation({ summary : 'Returns recent models for a tenant' })
    @ApiParam({ name: 'count', required: true, type: 'string' })
    async getRecentModelsByTenant(@Param() params: any, @Session() session): Promise<any> {
        return this.clueModelService.getRecentModelByTenantId(+params.count, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7011').then((theMessage: any): any => {
                return { status: 7011, message: theMessage, data: error };
            });
        });
    }
    @Get('model/user/recent/:count')
    @ApiOperation({ summary : 'Returns recent models for a user' })
    @ApiParam({ name: 'count', required: true, type: 'string' })
    async getRecentModelsByUser(@Param() params: any, @Session() session): Promise<any> {
        return this.clueModelService.getRecentModelByUserId(+params.count, session.user.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '7011').then((theMessage: any): any => {
                return { status: 7011, message: theMessage, data: error };
            });
        });
    }

}