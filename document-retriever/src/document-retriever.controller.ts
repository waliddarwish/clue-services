import { Get, Controller, Param, Put, Body, Post, Delete } from '@nestjs/common';
import { DocumentRetrieverService } from './document-retriever.service';
import { DocumentEntry } from '../../document-retrieving-module/src/document.entry';

@Controller('clue')
export class DocumentRetrieverController {

    constructor(private readonly documentRetrieverService: DocumentRetrieverService) {}

    @Put('document')
    async createDocument(@Body() reqBody: DocumentEntry): Promise<any> {
        return this.documentRetrieverService.createDocument(reqBody).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30001, message: "Internal Error", data: error };
        });
    }

    @Post('document/:id')
    async updateDocument(@Param() params, @Body() reqBody: DocumentEntry): Promise<any> {
        return this.documentRetrieverService.updateDocument(params.id , reqBody).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30002, message: "Internal Error", data: error };
        });
    }


    @Get('document/:id')
    async getDocument(@Param() params): Promise<any> {
        return this.documentRetrieverService.getDocument(params.id).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30003, message: "Internal Error", data: error };
        });
    }

    @Delete('document/:id')
    async deleteDocument(@Param() params): Promise<any> {
        return this.documentRetrieverService.deleteDocument(params.id).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30004, message: "Internal Error", data: error };
        });
    }


    @Get('document/category/:category')
    async getDocumentsByCategory(@Param() params): Promise<any> {
        return this.documentRetrieverService.getDocumentsByCategory(params.category).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30005, message: "Internal Error", data: error };
        });
    }

    @Get('document/keyword/:keyword')
    async getDocumentsByKeyword(@Param() params): Promise<any> {
        return this.documentRetrieverService.getDocumentsByKeyword(params.keyword).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30006, message: "Internal Error", data: error };
        });
    }

    

    @Get('document/search/:text')
    async searchDocuments(@Param() params): Promise<any> {
        return this.documentRetrieverService.searchDocuments(params.text).then(async (result) => {
            return { status: 0, data: result };
        }).catch(async (error) => {
            return { status: 30007, message: "Internal Error", data: error };
        });
    }
   
}