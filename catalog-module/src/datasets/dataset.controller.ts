import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { Controller, Put, Body, Session, Param, Get, Delete, Post } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { ApiOperation, ApiProperty, ApiParam, ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';
import { DatasetObject } from '../../../object-schema/src/schemas/catalog.dataset';
import { DatasetDataFileObject } from '../../../object-schema/src/schemas/catalog.dataset-datafile';

class CreateDatasetDTO {
    @ApiProperty()
    datasetName: string;
    @ApiProperty()
    datasetDescription: string;
}

class AssignFileIdDTO {
    @ApiProperty()
    fileName: string;
    @ApiProperty()
    datasetId: string;
    @ApiProperty()
    size: number;
    @ApiProperty()
    type: string;
}

class AnalyzeFileDTO {
    @ApiProperty()
    fileId: string;
}

class ImportFileDTO {
    @ApiProperty()
    fileId: string;
    @ApiProperty()
    datafileBody: DatasetDataFileObject;
}
@Controller('dataset')
@ApiTags('Datsets')
@ApiHeader( { name : "passport" } )
export class DatasetController {
    constructor(private readonly datasetService: DatasetService,
        private readonly globalizationService: GlobalizationService) { }

    @Put()
    @ApiOperation({ summary: "Creates a dataset"})
    @ApiBody({ type: CreateDatasetDTO})
    async createDataset(@Body() reqBody: CreateDatasetDTO, @Session() session): Promise<any> {
        return this.datasetService.createTenantDataset(reqBody.datasetName, reqBody.datasetDescription, session.user.tenantId, session.user.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14001').then((theMessage: any): any => {
                return { status: 14001, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }

    @Get(':id')
    @ApiOperation({ summary: "Find a dataset"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findDatasetById(@Param() params): Promise<any> {
        return this.datasetService.findDatasetById(params.id, true).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14002').then((theMessage: any): any => {
                return { status: 14002, message: theMessage, data: error };
            });
        });
    }

    @Delete(':id')
    @ApiOperation({ summary: "Delete a dataset"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteDatasetById(@Param() params): Promise<any> {
        return this.datasetService.deleteDatasetById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14003').then((theMessage: any): any => {
                return { status: 14003, message: theMessage, data: error };
            });
        });
    }

    @Delete()
    @ApiOperation({ summary: "Delete all dataset for the current user"})
    async deleteDatasets(@Session() session): Promise<any> {
        return this.datasetService.deleteDatasets(session.user.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: null };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14003').then((theMessage: any): any => {
                return { status: 14003, message: theMessage, data: error };
            });
        });
    }

    @Post(':id')
    @ApiOperation({ summary: "Update a dataset"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiBody({ type: DatasetObject})
    async updateDataset(@Param() params, @Body() body: DatasetObject): Promise<any> {
        return this.datasetService.updateDataset(params.id, body).then((result) => {
            console.log(result);
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14004').then((theMessage: any): any => {
                return { status: 14004, message: theMessage, data: error };
            });
        });
    }

    @Get('/user/:id')
    @ApiOperation({ summary: "Find a datasets by user id"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findDatasetsByUser(@Param() params): Promise<any> {
        return this.datasetService.findDatasetByUserId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14005').then((theMessage: any): any => {
                return { status: 14005, message: theMessage, data: error };
            });
        });
    }

    @Get()
    @ApiOperation({ summary: "Find all datasets for the current tenant"})
    async findDatasetsByTenant(@Session() session): Promise<any> {
        return this.datasetService.findDatasetByTenantId(session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14006').then((theMessage: any): any => {
                return { status: 14006, message: theMessage, data: error };
            });
        });
    }

    @Get('search/:searchText')
    @ApiOperation({ summary: "Search for datasets"})
    @ApiParam({ name: 'searchText', required: true, type: 'string' })
    async searchDatasets(@Param() params, @Session() session): Promise<any> {
        return this.datasetService.searchDataset(params.searchText, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14007').then((theMessage: any): any => {
                return { status: 14007, message: theMessage, data: error };
            });
        });
    }

    @Get('recent/:count')
    @ApiOperation({ summary: "Returns recent dataset"})
    @ApiParam({ name: 'count', required: true, type: 'string' })
    async getRecentDatasets(@Param() params: any, @Session() session): Promise<any> {
        return this.datasetService.getRecentDatasets(+params.count, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '3011').then((theMessage: any): any => {
                return { status: 3011, message: theMessage, data: error };
            });
        });
    }


    @Put('assign-fid')
    @ApiOperation({ summary: "Assigns a file id for upload to a dataset"})
    @ApiBody({ type: AssignFileIdDTO})
    async assignFid(@Body() reqBody: AssignFileIdDTO): Promise<any> {
        return this.datasetService.assignNewFileId(reqBody.fileName, reqBody.datasetId , reqBody.size , reqBody.type).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14012').then((theMessage: any): any => {
                return { status: 14012, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }


    @Put('analyze-file')
    @ApiOperation({ summary: "Analyze an uploaded file"})
    @ApiBody({ type: AnalyzeFileDTO})
    async analyzeFile(@Body() reqBody: AnalyzeFileDTO, @Session() session): Promise<any> {
        return this.datasetService.analyzeFile(reqBody.fileId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14012').then((theMessage: any): any => {
                return { status: 14012, message: theMessage, data: JSON.stringify(error) };
            });
        });
    }

    @Put('import-file')
    @ApiOperation({ summary: "Import a data file"})
    @ApiBody({ type: ImportFileDTO })
    async importFile(@Body() reqBody: ImportFileDTO, @Session() session): Promise<any> {
        return this.datasetService.importFile(reqBody.fileId, session.user.tenantId, session.user.id, reqBody.datafileBody).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14017').then((theMessage: any): any => {
                return { status: 14017, message: theMessage, data: error.message };
            });
        });
    }

    @Get('/datafile/:id')
    @ApiOperation({ summary: "Returns a data file by id"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findDataFileById(@Param() params): Promise<any> {
        return this.datasetService.findDatafileById(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14013').then((theMessage: any): any => {
                return { status: 14013, message: theMessage, data: error };
            });
        });
    }


    @Get('/dataset-files/:id')
    @ApiOperation({ summary: "Returns data files for a dataset"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async findDatasetFiles(@Param() params): Promise<any> {
        return this.datasetService.findDataFilesByDatasetId(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14014').then((theMessage: any): any => {
                return { status: 14014, message: theMessage, data: error };
            });
        });
    }

    @Delete('/datafile/:id')
    @ApiOperation({ summary: "Deletes a data file"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteDatafileById(@Param() params, @Session() session): Promise<any> {
        return this.datasetService.deleteDatafile(params.id, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14015').then((theMessage: any): any => {
                return { status: 14015, message: theMessage, data: error };
            });
        });
    }

    @Delete('/dataset/:id')
    @ApiOperation({ summary: "Deletes a dataset"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async deleteDataset(@Param() params, @Session() session): Promise<any> {
        return this.datasetService.deleteDataset(params.id, session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14016').then((theMessage: any): any => {
                return { status: 14016, message: theMessage, data: error };
            });
        });
    }


    @Post('/datafile/:id')
    @ApiOperation({ summary: "Updates a data file"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiBody({ type: DatasetDataFileObject })
    async updateDatafile(@Param() params, @Body() body: DatasetDataFileObject): Promise<any> {
        return this.datasetService.updateDatafile(params.id, body).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14004').then((theMessage: any): any => {
                return { status: 14004, message: theMessage, data: error };
            });
        });
    }


    @Delete('/tenant/:id')
    @ApiOperation({ summary: "Delete a tenant data store"})
    async deleteTenant(@Param() params): Promise<any> {
        return this.datasetService.deleteTenant(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14016').then((theMessage: any): any => {
                return { status: 14016, message: theMessage, data: error };
            });
        });
    }


    @Get('/database-size')
    @ApiOperation({ summary: "Returns tenant database size in megabytes"})
    async getDatabaseSize( @Session() session): Promise<any> {
        return this.datasetService.getDatabaseSize(session.user.tenantId).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '14014').then((theMessage: any): any => {
                return { status: 14014, message: theMessage, data: error };
            });
        });
    }
}
