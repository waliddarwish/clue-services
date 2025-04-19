
import { DocumentRetrieverService } from './document-retriever.service';


describe('Test DocumentRetriever Service', () => {
    let documentRetrieverService ;
   

    
    describe("Test Create document" , () =>  {
        let documentModel = jest.fn();
       
        let documentCreated = {
            save: jest.fn()
        }       
        documentModel.mockImplementation(() => (documentCreated));


        let connection = { 
            model : jest.fn()
        }
        connection.model.mockImplementation(()=>(documentModel));

       


        beforeEach(async () => {
            documentRetrieverService = await new DocumentRetrieverService();
            documentRetrieverService.initService(connection);
        });
    
        
        it("Test create document - success ", async () => {
    
    
    
            let documentEntry = {
                documentTitle: "Some document title",
                documentSubTitle: 'Some document subtitle',
                documentContent: "Some document content",
                category: "Some category",
                keywords: ["Some keyword 1" , "Some keyword 2"],
                order: 1
            };
            let result = await documentRetrieverService.createDocument(documentEntry);
            expect(documentModel).toHaveBeenCalledTimes(1);
            expect(documentCreated.save).toHaveBeenCalledTimes(1);
    
        });

         // it("Test create document - failure 1 ", async () => {

    //     let documentModel = jest.fn();
   
    //     let documentCreated = {
    //         save: jest.fn()
    //     }

    //     documentModel.mockRejectedValue({error: "Some Error"});

    //     let connection = { 
    //         model : jest.fn()
    //     }
    //     connection.model.mockImplementation(()=>(documentModel));
    //     documentRetrieverService.initService(connection);

    //     let documentEntry = {
    //         documentTitle: "Some document title",
    //         documentSubTitle: 'Some document subtitle',
    //         documentContent: "Some document content",
    //         category: "Some category",
    //         keywords: ["Some keyword 1" , "Some keyword 2"],
    //         order: 1
    //     };
    //     let result = await documentRetrieverService.createDocument(documentEntry);
    //     expect(documentRetrieverService.createDocument).toThrow;

    // });

    });


    describe(("Test Service functions") , () =>  {
       
             
        let documentModel = {
            exec: jest.fn(),
            findOneAndUpdate: jest.fn().mockImplementation(() => documentModel),
            findOne: jest.fn().mockImplementation(() => documentModel),
            find: jest.fn().mockImplementation(() => documentModel),
            deleteOne: jest.fn().mockImplementation(() => documentModel),
        }

        documentModel.exec.mockImplementation(()=> (documentModel));

        let connection = { 
            model : jest.fn()
        }
        connection.model.mockImplementation(()=>(documentModel));

       


        beforeEach(async () => {
            documentRetrieverService = await new DocumentRetrieverService();
            documentRetrieverService.initService(connection);
        });

        it ("Test updateDocument success" , async () =>  {
            documentModel.exec.mockResolvedValue({id: "Some document id"});
            let result = await documentRetrieverService.updateDocument("Some document id" , {});
            expect(result.id).toEqual("Some document id");
            expect(documentModel.findOneAndUpdate).toHaveBeenCalled();
        });

        it ("Test updateDocument failure" , async () =>  {
            documentModel.exec.mockRejectedValue({error: "Some Error"});
            expect(documentRetrieverService.updateDocument("Some document id" , {})).toThrow;
            expect(documentModel.findOneAndUpdate).toHaveBeenCalled();
        });

        it ("Test getDocument success" , async () =>  {
            documentModel.exec.mockResolvedValue({id: "Some document id"});
            let result = await documentRetrieverService.getDocument("Some document id");
            expect(result[0].id).toEqual("Some document id");
            expect(documentModel.findOne).toHaveBeenCalled();
        });

        it ("Test getDocument failure" , async () =>  {
            documentModel.exec.mockRejectedValue({error: "Some Error"});
            expect(documentRetrieverService.getDocument("Some document id")).toThrow;
            expect(documentModel.findOne).toHaveBeenCalled();
        });

        it ("Test deleteDocument success" , async () =>  {
            documentModel.exec.mockResolvedValue({id: "Some document id"});
            let result = await documentRetrieverService.deleteDocument("Some document id");
            expect(documentModel.deleteOne).toHaveBeenCalled();
        });

        it ("Test deleteDocument failure" , async () =>  {
            documentModel.exec.mockRejectedValue({error: "Some Error"});
            expect(documentRetrieverService.deleteDocument("Some document id")).toThrow;
            expect(documentModel.deleteOne).toHaveBeenCalled();
        });


        it ("Test getDocumentsByCategory success" , async () =>  {
            documentModel.exec.mockResolvedValue([{id: "Some document id"}]);
            let result = await documentRetrieverService.getDocumentsByCategory("Some Categroy");
            expect(result[0].id).toEqual("Some document id");
            expect(documentModel.find).toHaveBeenCalled();
        });

        it ("Test getDocumentsByCategory failure" , async () =>  {
            documentModel.exec.mockRejectedValue({error: "Some Error"});
            expect(documentRetrieverService.getDocumentsByCategory("Some document id")).toThrow;
            expect(documentModel.find).toHaveBeenCalled();
        });

        it ("Test getDocumentsByKeyword success" , async () =>  {
            documentModel.exec.mockResolvedValue([{id: "Some document id"}]);
            let result = await documentRetrieverService.getDocumentsByKeyword("Some Keyword");
            expect(result[0].id).toEqual("Some document id");
            expect(documentModel.find).toHaveBeenCalled();
        });

        it ("Test getDocumentsByKeyword failure" , async () =>  {
            documentModel.exec.mockRejectedValue({error: "Some Error"});
            expect(documentRetrieverService.getDocumentsByKeyword("Some document id")).toThrow;
            expect(documentModel.find).toHaveBeenCalled();
        });

        it ("Test searchDocuments success" , async () =>  {
            documentModel.exec.mockResolvedValue([{id: "Some document id"}]);
            let result = await documentRetrieverService.searchDocuments("Some text");
            expect(result[0].id).toEqual("Some document id");
            expect(documentModel.find).toHaveBeenCalled();
        });

        it ("Test searchDocuments failure" , async () =>  {
            documentModel.exec.mockRejectedValue({error: "Some Error"});
            expect(documentRetrieverService.searchDocuments("Some document id")).toThrow;
            expect(documentModel.find).toHaveBeenCalled();
        });
    });


});
