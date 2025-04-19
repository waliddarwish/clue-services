
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { DocumentService } from './document.service';


const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    put: jest.fn()
};

describe("Test document service", () => {

    let httpService;
    let documentService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DocumentService,
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        documentService = await module.get<DocumentService>(DocumentService);
    });

    describe("Test createDocument", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.createDocument({ documentTitle: 'some document' })).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document', { documentTitle: 'some document' });
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.createDocument({ documentTitle: 'some document' })).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document', { documentTitle: 'some document' });
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.createDocument({ documentTitle: 'some document' })).rejects.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document', { documentTitle: 'some document' });
        });



    });



    describe("Test updateDocument", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.updateDocument("id", { documentTitle: 'some document' })).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id', { documentTitle: 'some document' });
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.updateDocument("id", { documentTitle: 'some document' })).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id', { documentTitle: 'some document' });
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.createDocument("id", { documentTitle: 'some document' })).rejects.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id', { documentTitle: 'some document' });
        });



    });



    describe("Test getDocument", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.getDocument("id")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.getDocument("id")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.getDocument("id")).rejects.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });



    });

    describe("Test deleteDocument", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.delete.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.deleteDocument("id")).resolves.toEqual(result);
            expect(httpService.delete).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.delete.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.deleteDocument("id")).resolves.toEqual(result);
            expect(httpService.delete).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.delete.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.deleteDocument("id")).rejects.toEqual(result);
            expect(httpService.delete).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });



    });


    describe("Test deleteDocument", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.delete.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.deleteDocument("id")).resolves.toEqual(result);
            expect(httpService.delete).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.delete.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.deleteDocument("id")).resolves.toEqual(result);
            expect(httpService.delete).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.delete.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.deleteDocument("id")).rejects.toEqual(result);
            expect(httpService.delete).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/id');
        });

    });


    describe("Test getDocumentsByCategory", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.getDocumentsByCategory("category")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/category/category');
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.getDocumentsByCategory("category")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/category/category');
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.getDocumentsByCategory("category")).rejects.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/category/category');
        });


    });

    describe("Test getDocumentsByKeyword", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.getDocumentsByKeyword("keyword")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/keyword/keyword');
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.getDocumentsByKeyword("keyword")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/keyword/keyword');
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.getDocumentsByKeyword("keyword")).rejects.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/keyword/keyword');
        });


    });

    describe("Test searchDocuments", () => {
        it("success", () => {
            let result = {
                status: 0,
                data: {
                    documentTitle: 'some document'
                }
            };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.searchDocuments("text")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/search/text');
        });

        it("failure - 1", () => {
            let result = { status: 30001, message: 'Internal Error', data: "Some Error" };

            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(documentService.searchDocuments("text")).resolves.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/search/text');
        });

        it("failure - 2", () => {
            let result = { error: "Some error" };
            httpService.get.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(result);
            expect(documentService.searchDocuments("text")).rejects.toEqual(result);
            expect(httpService.get).toBeCalledWith('http://' + 'document-retriever' + ':' + '8460' + '/clue/document/search/text');
        });


    });

});