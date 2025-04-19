import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { MetadataImportingService } from './metadata-importing.service';




let mockHttpService = {
    post: jest.fn(),
    put: jest.fn()
};

const mockObservable = {
    toPromise: jest.fn()
}

describe('MetadataImportingService test', () => {
    let httpService;
    let metadataImportingService;
    let tenantId = '43953';
    let userId = '493543223';
    let modelId = '943-9437347';
    let trackerId = '9343297342';
    let objects = [];
    let connection;
    connection = {};

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        metadataImportingService = new MetadataImportingService(httpService);
    });

    it('test importObjects scenario 1', async () => {
        httpService.put.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue({data: 'fixed'});
        //mockHttpService.put.mockReturnValue(Promise.resolve({data: 'fixed'}));
        let result = await metadataImportingService.importObjects(tenantId, userId, modelId, trackerId, objects, connection);
        expect(result).toEqual('fixed');
        expect(httpService.put).toBeCalledTimes(1);
        expect(httpService.put).toBeCalledWith("http://metadata-importer:8360/metadata-importer/import-objects/43953/493543223/943-9437347/9343297342", {"connection": {}, "objects": []});

    });

    it('toPromise will throw an exception', () => {
        let result = { result: 'Internal Error' };
        httpService.put.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockRejectedValue(new Error('failed'));
        expect(metadataImportingService.importObjects(tenantId, userId, modelId, trackerId, objects, connection)).resolves.toEqual(result);
        expect(httpService.put).toBeCalledTimes(1);
        expect(httpService.put).toBeCalledWith("http://metadata-importer:8360/metadata-importer/import-objects/43953/493543223/943-9437347/9343297342", {"connection": {}, "objects": []});

    });
});