
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { QueryGeneratorService } from './query-generator.service';
import { ClueModelObjectEntry } from '../../object-schema/src/schemas/catalog.model-object';
import { QueryDefinition } from '../../object-schema/src/schemas/query-definition';



const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn(),
    put: jest.fn()
};



describe('Test query generator module', () => {
    let httpService;
    let queryGeneratorService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                QueryGeneratorService,
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        queryGeneratorService = await module.get<QueryGeneratorService>(QueryGeneratorService);
    });

    describe('Test queryGenerator', () => {
        let theModels: ClueModelObjectEntry[] = [];
        let theQueryDefinition: QueryDefinition = {
            id: '',
            rowLimit: 0, ignoreCache: true
            , selectDistinct: true, generateQueryOnly: true,
            projections: [],
            filters: []
        };
        let theConnections = [];
        let theDatasets = [];

        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "query"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(queryGeneratorService.queryGenerator(theModels, theQueryDefinition, theConnections, theDatasets)).resolves.toEqual(result.data);
            expect(httpService.put).toBeCalledWith('http://' + 'query-generator' + ':' + '8410'
                + '/query-generator/generate-query', { queryDefinition: theQueryDefinition, models: theModels, connections: theConnections, datasets: theDatasets })
        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(queryGeneratorService.queryGenerator(theModels, theQueryDefinition, theConnections, theDatasets)).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'query-generator' + ':' + '8410'
                + '/query-generator/generate-query', { queryDefinition: theQueryDefinition, models: theModels, connections: theConnections, datasets: theDatasets })

        });
    });


    describe('Test generateGraphByModelId', () => {
        let theModelId = 'modelId';

        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "graph"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(queryGeneratorService.generateGraphByModelId(theModelId)).resolves.toEqual(result.data);
            expect(httpService.put).toBeCalledWith('http://' + 'query-generator' + ':' + '8410'
                + '/query-generator/generate-model-graph', { modelId: theModelId });
        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(queryGeneratorService.generateGraphByModelId(theModelId)).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'query-generator' + ':' + '8410'
                + '/query-generator/generate-model-graph', { modelId: theModelId });
        });
    });


    describe('Test generateGraphByModelObjectIds', () => {
        let theModelObjectIds = [];

        it('will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "graph"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(queryGeneratorService.generateGraphByModelObjectIds(theModelObjectIds)).resolves.toEqual(result.data);
            expect(httpService.put).toBeCalledWith('http://' + 'query-generator' + ':' + '8410'
                + '/query-generator/graph-for-model-objects', { modelObjectIds: theModelObjectIds });
        });

        it('toPromise will throw an exception', () => {
            let output = { result: 'Internal Error' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(queryGeneratorService.generateGraphByModelObjectIds(theModelObjectIds)).resolves.toEqual(output);
            expect(httpService.put).toBeCalledWith('http://' + 'query-generator' + ':' + '8410'
                + '/query-generator/graph-for-model-objects', { modelObjectIds: theModelObjectIds });
        });
    });

});