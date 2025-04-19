import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { Controller, Session, Body, Put, Post, Param, Get, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';
import { DocumentService } from '../../../document-retrieving-module/src/document.service';
import { DocumentEntry } from '../../../document-retrieving-module/src/document.entry';

@Controller('document')
@ApiTags('Documents')

export class DocumentController {
    constructor(private readonly documentService: DocumentService,
        private readonly globalizationService: GlobalizationService) { }

    @Put()
    @ApiOperation({ summary: "Create a document connection" })
    @ApiBody({ type: DocumentEntry })
    @ApiHeader({ name: 'passport'})
    async createDocument(@Body() reqBody: DocumentEntry): Promise<any> {
        return this.documentService.createDocument(reqBody).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30001').then((theMessage: any): any => {
                return { status: 30001, message: theMessage, data: error };
            });
        });
    }

    @Post(':id')
    @ApiOperation({ summary: "Updates a document"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiBody({ type: DocumentEntry  })
    @ApiHeader({ name: 'passport'})
    async updateDocument(@Param() params, @Body() body : DocumentEntry ): Promise<any> {
        return this.documentService.updateDocument(params.id, body).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30002').then((theMessage: any): any => {
                return { status: 30002, message: theMessage, data: error };
            });
        });
    }

    @Delete(':id')
    @ApiOperation({ summary: "Deletes a document"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiHeader({ name: 'passport'})
    async deleteDocument(@Param() params): Promise<any> {
        return this.documentService.deleteDocument(params.id).then((result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30004').then((theMessage: any): any => {
                return { status: 30004, message: theMessage, data: error };
            });
        });
    }

    @Get(':id')
    @ApiOperation({ summary: "Finds a document"})
    @ApiParam({ name: 'id', required: true, type: 'string' })
    async getDocument(@Param() params): Promise<any> {
        return this.documentService.getDocument(params.id).then( (result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30003').then((theMessage: any): any => {
                return { status: 30003, message: theMessage, data: error };
            });
        });
    }

    @Get('category/:category')
    @ApiOperation({ summary: "Finds a document by category"})
    @ApiParam({ name: 'category', required: true, type: 'string' })
    async getDocumentsByCategory(@Param() params): Promise<any> {
        return this.documentService.getDocumentsByCategory(params.category).then( (result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30005').then((theMessage: any): any => {
                return { status: 30005, message: theMessage, data: error };
            });
        });
    }

    @Get('keyword/:keyword')
    @ApiOperation({ summary: "Finds a document by keyword"})
    @ApiParam({ name: 'keyword', required: true, type: 'string' })
    async getDocumentsByKeyword(@Param() params): Promise<any> {
        return this.documentService.getDocumentsByKeyword(params.keyword).then( (result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30006').then((theMessage: any): any => {
                return { status: 30006, message: theMessage, data: error };
            });
        });
    }


    @Get('search/:text')
    @ApiOperation({ summary: "Search in document contents"})
    @ApiParam({ name: 'text', required: true, type: 'string' })
    async searchDocuments(@Param() params): Promise<any> {
        return this.documentService.searchDocuments(params.text).then( (result) => {
            return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage, data: result };
            });
        }).catch((error) => {
            return this.globalizationService.get('en', '30007').then((theMessage: any): any => {
                return { status: 30007, message: theMessage, data: error };
            });
        });
    }
}
