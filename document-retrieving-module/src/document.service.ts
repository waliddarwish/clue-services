import { Injectable, HttpService, Inject } from '@nestjs/common';
import { DocumentEntry } from './document.entry';

@Injectable()
export class DocumentService {
    constructor(private readonly httpService: HttpService) {
    }


    async createDocument(document : DocumentEntry): Promise<any> {
        return this.httpService.put('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document' , document).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }

    async updateDocument(id : string, document : DocumentEntry): Promise<any> {
        return this.httpService.post('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document/' + id , document).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }

    async getDocument(id : string): Promise<any> {
        return this.httpService.get('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document/' + id).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }

    async deleteDocument(id : string): Promise<any> {
        return this.httpService.delete('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document/' + id).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }

    async getDocumentsByCategory(category : string): Promise<any> {
        return this.httpService.get('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document/category/' + category).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }

    async getDocumentsByKeyword(keyword : string): Promise<any> {
        return this.httpService.get('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document/keyword/' + keyword).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }

    async searchDocuments(text : string): Promise<any> {
        return this.httpService.get('http://' + 'document-retriever' + ':' + '8460'
            + '/clue/document/search/' + text).toPromise().then((result: any) => {
                if (result  && result.data && result.data.status === 0) {
                    return result.data; 
                } else {
                    throw result.data;
                }
            }); 
    }
}
