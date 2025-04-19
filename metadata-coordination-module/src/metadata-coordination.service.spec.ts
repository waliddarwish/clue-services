import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import {MetadataCoordinationService} from './metadata-coordination.service';
import { userInfo } from 'os';


let mockHttpService = {
    post: jest.fn(),
    put: jest.fn()
};

const mockObservable = {
    toPromise: jest.fn()
}
describe('MetadataCoordinationService test', () => {
    let httpService;
    let connection;
    connection = {name: 'connections'};
    let schemaName = 'schema_name';
    let model;
    model = {name: 'model'};
    let importSpec = ['specs'];
    let tenantId = '3943729023';
    let userId = '98366353';
    let trackerId = '9384743';
    let metadataCoordinationService: MetadataCoordinationService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        metadataCoordinationService = new MetadataCoordinationService(httpService);
    });



    it('test importObjects scenario 1', async () => {
        httpService.post.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue({data: 'fixed'});
        let result = await metadataCoordinationService.getSchemaObjects(connection,  schemaName);
        expect(result).toEqual('fixed');
        expect(httpService.post).toBeCalledTimes(1);
        expect(httpService.post).toBeCalledWith("http://metadata-coordinator:8380/metadata-coordinator/schema_name/objects", {"name": "connections"});

    });

    it('test importObjects scenario 2', async () => {
        httpService.post.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockRejectedValue(new Error('failed'));
        let result = await metadataCoordinationService.getSchemaObjects(connection,  schemaName);
        expect(result).toEqual({"result": "Internal Error: {}"});
        expect(httpService.post).toBeCalledTimes(1);
        expect(httpService.post).toBeCalledWith("http://metadata-coordinator:8380/metadata-coordinator/schema_name/objects", {"name": "connections"});

    });

    it('test getSchemas scenario 1', async () => {
        httpService.post.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue({data: 'fixed'});

        let result = await metadataCoordinationService.getSchemas(connection);
        expect(result).toEqual('fixed');
        expect(httpService.post).toBeCalledTimes(1);
        expect(httpService.post).toBeCalledWith("http://metadata-coordinator:8380/metadata-coordinator/schemas", {"name": "connections"});

    });

    it('test getSchemas scenario 2', async () => {
        httpService.post.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockRejectedValue(new Error('failed'));
        let result = await metadataCoordinationService.getSchemas(connection);
        expect(result).toEqual({"result": "Internal Error"});
        expect(httpService.post).toBeCalledTimes(1);
        expect(httpService.post).toBeCalledWith("http://metadata-coordinator:8380/metadata-coordinator/schemas", {"name": "connections"});

    });

    it('test importModel scenario 1', async () => {
        httpService.post.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue({data: 'fixed'});

        let result = await metadataCoordinationService.importModel(model, importSpec, tenantId, userId, trackerId);
        expect(result).toEqual('fixed');
        expect(httpService.post).toBeCalledTimes(1);
        expect(httpService.post).toBeCalledWith( "http://metadata-coordinator:8380/metadata-coordinator/import/9384743/3943729023/98366353", {"importSpecs": ["specs"], "model": {"name": "model"}});
    });

    it('test importModel scenario 2', async () => {
        httpService.post.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockRejectedValue(new Error('failed'));
        let result = await metadataCoordinationService.importModel(model, importSpec, tenantId, userId, trackerId);
        expect(result).toEqual({"result": "Internal Error"});
        expect(httpService.post).toBeCalledTimes(1);
        expect(httpService.post).toBeCalledWith( "http://metadata-coordinator:8380/metadata-coordinator/import/9384743/3943729023/98366353", {"importSpecs": ["specs"], "model": {"name": "model"}});
    });

});