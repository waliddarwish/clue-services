
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { QueryExecutorService } from './query-executor.service';




const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn(),
    put: jest.fn()
};


describe('Test query executor module', () => {
    let httpService;
    let queryExecutorService;
    let theQueryString = '';
    let theConnections = [];
    let theQueryDefinition = {};
    let theModels = [];
    let theDatasets = [];

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                QueryExecutorService,
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        queryExecutorService = await module.get<QueryExecutorService>(QueryExecutorService);
    });


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
        expect(queryExecutorService.executeQuery(theQueryString, theConnections, theQueryDefinition, theModels, theDatasets)).resolves.toEqual(result.data);
        expect(httpService.put).toBeCalledWith('http://' + 'query-executor' + ':' + '8420'
            + '/query-executor/execute-query', { queryString: theQueryString, connections: theConnections, queryDefinition: theQueryDefinition, models: theModels, datasets: theDatasets })
    });

    it('toPromise will throw an exception', () => {
        let result = { result: 'Internal Error' };
        httpService.put.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockRejectedValue(new Error('failed'));
        expect(queryExecutorService.executeQuery(theQueryString, theConnections, theQueryDefinition, theModels, theDatasets)).resolves.toEqual(result);
        expect(httpService.put).toBeCalledWith('http://' + 'query-executor' + ':' + '8420'
            + '/query-executor/execute-query', { queryString: theQueryString, connections: theConnections, queryDefinition: theQueryDefinition, models: theModels, datasets: theDatasets })

    });
});