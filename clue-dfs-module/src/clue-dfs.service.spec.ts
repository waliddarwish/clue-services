import { Test } from '@nestjs/testing';
import { ClueDFSService } from './clue-dfs.service';
import { HttpService } from '@nestjs/common';
 


describe('Test ClueDFSService' , () => {
    
    const mockWeedConfig = {
        
    }
    const mockObservable = {
        toPromise: jest.fn()
    }
    
    let mockHttpService = {
        post: jest.fn( () => mockObservable)
    };

    let httpService;
    let clueDFSService;

    

    beforeEach( async () => {
        const module = await Test.createTestingModule({
            providers: [
                ClueDFSService,
                { provide: HttpService, useFactory: () => { return mockHttpService } } ,
            ]
       }).compile();

       httpService = await module.get<HttpService>(HttpService);
       clueDFSService = await module.get<ClueDFSService>(ClueDFSService);
       clueDFSService.seaweedClient = {
            write: jest.fn(() => Promise.resolve({ data: {} })),
            read: jest.fn(() => Promise.resolve({ data: {} })),
            remove: jest.fn(() => Promise.resolve({ data: {} })),
            vacuum: jest.fn(() => Promise.resolve({ data: {} })),
       }
       
    });


    describe("Test ClueDFSService.writeFile" , () => {

        it("test success" , () => {
            clueDFSService.seaweedClient.write.mockResolvedValue({});
            expect(clueDFSService.writeFile(["fileName1" , "fileName2"] , {})).resolves;
            expect(clueDFSService.seaweedClient.write).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.write).toHaveBeenCalledWith(["fileName1" , "fileName2"] , {});
        });

        it("test failure" , () => {
            clueDFSService.seaweedClient.write.mockRejectedValue({});
            expect(clueDFSService.writeFile(["fileName1" , "fileName2"] , {})).rejects;
            expect(clueDFSService.seaweedClient.write).rejects;
            expect(clueDFSService.seaweedClient.write).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.write).toHaveBeenCalledWith(["fileName1" , "fileName2"] , {});
            
        });
    });

    describe("Test ClueDFSService.readFile" , () => {

        it("test success" , () => {
            clueDFSService.seaweedClient.read.mockResolvedValue({});
            expect(clueDFSService.readFile("fileId1")).resolves;
            expect(clueDFSService.seaweedClient.read).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.read).toHaveBeenCalledWith("fileId1");
        });

        it("test failure" , () => {
            clueDFSService.seaweedClient.read.mockRejectedValue({});
            expect(clueDFSService.readFile("fileId1")).rejects;
            expect(clueDFSService.seaweedClient.read).rejects;
            expect(clueDFSService.seaweedClient.read).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.read).toHaveBeenCalledWith("fileId1");
            
        });
    });

    describe("Test ClueDFSService.removeFile" , () => {

        it("test success" , () => {
            clueDFSService.seaweedClient.remove.mockResolvedValue({});
            expect(clueDFSService.removeFile("fileId1")).resolves;
            expect(clueDFSService.seaweedClient.remove).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.remove).toHaveBeenCalledWith("fileId1");
        });

        it("test failure" , () => {
            clueDFSService.seaweedClient.remove.mockRejectedValue({});
            expect(clueDFSService.removeFile("fileId1")).rejects;
            expect(clueDFSService.seaweedClient.remove).rejects;
            expect(clueDFSService.seaweedClient.remove).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.remove).toHaveBeenCalledWith("fileId1");
            
        });
    });

    describe("Test ClueDFSService.vaccum" , () => {
        let garbageThreshold = 0.4;
        it("test success" , () => {
            clueDFSService.seaweedClient.vacuum.mockResolvedValue({});
            expect(clueDFSService.vaccum(garbageThreshold)).resolves;
            expect(clueDFSService.seaweedClient.vacuum).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.vacuum).toHaveBeenCalledWith({garbageThreshold});
        });

        it("test failure" , () => {
            clueDFSService.seaweedClient.remove.mockRejectedValue({});
            expect(clueDFSService.vaccum(garbageThreshold)).rejects;
            expect(clueDFSService.seaweedClient.vacuum).rejects;
            expect(clueDFSService.seaweedClient.vacuum).toHaveBeenCalledTimes(1);
            expect(clueDFSService.seaweedClient.vacuum).toHaveBeenCalledWith({garbageThreshold});
            
        });
    });

    describe("Test ClueDFSService.assignFid" ,  () =>  {
        beforeEach(() => { 
            httpService.post = jest.fn( () => mockObservable);
            mockObservable.toPromise =  jest.fn();
        });
        it ("test success" , async () => {
            let result = {data : "Some data"};
            mockObservable.toPromise.mockResolvedValue(result);
            let callResult = await clueDFSService.assignFid();
            expect(callResult).toEqual(result.data);
            expect(httpService.post).toHaveBeenCalledTimes(1);
            expect(mockObservable.toPromise).toHaveBeenCalledTimes(1);
            expect(httpService).resolves;

        });
        it ("test failure", async () => {
            let error = {  message : "Some Error Message" };
            mockObservable.toPromise.mockRejectedValue(error);
            let callResult = await clueDFSService.assignFid();
            expect(callResult).toEqual({ result: 'Internal Error: ' + JSON.stringify(error)});
            expect(httpService.post).toHaveBeenCalledTimes(1);
            expect(httpService.post).rejects;

        });
    });

    describe("Test ClueDFSService.lookupVolumeUrl" ,  () =>  {
        beforeEach(() => { 
            httpService.post = jest.fn( () => mockObservable);
            mockObservable.toPromise =  jest.fn();
        });

        it ("test success" , async () => {
            let result = {data : "Some data"};
            mockObservable.toPromise.mockResolvedValue(result);
            let callResult = await clueDFSService.lookupVolumeUrl("Some volume");
            expect(callResult).toEqual(result.data);
            expect(httpService.post).toHaveBeenCalledTimes(1);
            expect(mockObservable.toPromise).toHaveBeenCalledTimes(1);
            expect(httpService).resolves;

        });
        it ("test failure", async () => {
            let error = {  message : "Some Error Message" };
            mockObservable.toPromise.mockRejectedValue(error);
            expect(clueDFSService.lookupVolumeUrl("Some volume")).rejects.toEqual(error);
            expect(httpService.post).toHaveBeenCalledTimes(1);
            expect(httpService.post).rejects;
        });
        
    });

    describe("Test ClueDFSService.lookupVolumeUrl" ,  () =>  {
        beforeEach(() => { 
            clueDFSService.lookupVolumeUrl = jest.fn(() => Promise.resolve({ data: {} }));

        });

        it ("test success 1" , async () => {
            clueDFSService.lookupVolumeUrl.mockResolvedValue({
                locations: [
                    { 
                        publicUrl: "Some public url",
                        url: "Some url",
                    }
                ]
            });
           let callResult = await clueDFSService.renderFileUrl("Some Volume" , "Some file" , "Some extention" , true );
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledTimes(1);
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledWith("Some Volume");
           expect(callResult).toEqual( 'http://Some public url/Some Volume,Some file.Some extention');
        });

        it ("test success 2" , async () => {
            clueDFSService.lookupVolumeUrl.mockResolvedValue({
                locations: [
                    { 
                        publicUrl: "Some public url",
                        url: "Some url",
                    }
                ]
            });
           let callResult = await clueDFSService.renderFileUrl("Some Volume" , "Some file" , "" , true );
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledTimes(1);
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledWith("Some Volume");
           expect(callResult).toEqual( 'http://Some public url/Some Volume,Some file');
        });

        it ("test success 3" , async () => {
            clueDFSService.lookupVolumeUrl.mockResolvedValue({
                locations: [
                    { 
                        publicUrl: "Some public url",
                        url: "Some url",
                    }
                ]
            });
           let callResult = await clueDFSService.renderFileUrl("Some Volume" , "Some file" , "" , false );
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledTimes(1);
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledWith("Some Volume");
           expect(callResult).toEqual( 'http://Some url/Some Volume,Some file');
        });

        it ("test failure" , async () => {
            clueDFSService.lookupVolumeUrl.mockRejectedValue({message: "Some error message"});
           expect(clueDFSService.renderFileUrl("Some Volume" , "Some file" , "" , false )).rejects;
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledTimes(1);
           expect(clueDFSService.lookupVolumeUrl).toHaveBeenCalledWith("Some Volume");
        });
        
    });



});
