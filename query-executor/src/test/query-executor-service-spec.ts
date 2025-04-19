import { Test } from '@nestjs/testing';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { QueryExecutorService } from '../query-executor.service';
import queryExecutorFactory = require('../executors/executor.factory');

describe('Test query executor service', () => {
    let tenantDatasetDatabaseProvider;
    let clueSettingsProvider;
    let queryExecutorService;
    let connectionTrackerService;
    let authenticationService;

    let mockConnectionTrackerService = {

    };

    let mockAuthenticationService = {

    };


    let abstractQueryExecutor = {
        executeQuery: jest.fn()
    };


    beforeEach(async () => {
        tenantDatasetDatabaseProvider = {
            exec: jest.fn(),
            findOneAndUpdate: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            findOne: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            save: jest.fn(),
            create: jest.fn()
        };


        clueSettingsProvider = {
            exec: jest.fn(),
            findOneAndUpdate: jest.fn().mockImplementation(() => (clueSettingsProvider)),
            findOne: jest.fn().mockImplementation(() => (clueSettingsProvider)),
            save: jest.fn(),
            create: jest.fn()
        };



        const module = await Test.createTestingModule({
            providers: [
                { provide: ConnectionTrackerService, useFactory: () => { return mockConnectionTrackerService } },
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
                { provide: QueryExecutorService, useValue: new QueryExecutorService(tenantDatasetDatabaseProvider, clueSettingsProvider, connectionTrackerService, authenticationService) }
            ]
        }).compile();

        connectionTrackerService = await module.get<ConnectionTrackerService>(ConnectionTrackerService);
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);
        queryExecutorService = await module.get<QueryExecutorService>(QueryExecutorService);
        

        jest.genMockFromModule('../executors/executor.factory');
        jest.mock('../executors/executor.factory');
    });

    it('execute query successfully', async () => {
        queryExecutorFactory.instantiateExecutor = jest.fn().mockReturnValue(abstractQueryExecutor);
         abstractQueryExecutor.executeQuery.mockReturnValue({queryData: "hello"});
        let result = queryExecutorService.executeQuery({}, [],{}, [], []);
    });

    it('Fail to execute because there is executor', async () => {
        queryExecutorFactory.instantiateExecutor = jest.fn().mockReturnValue(null);
        expect(() => { queryExecutorService.executeQuery({}, [],{}, [], [])}).toThrow(new Error("Error. Executor is null. Handle me!!!"));
    });


});