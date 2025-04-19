import { Test } from '@nestjs/testing';
import { CockroachQueryExecutorImpl } from '../executors/executor-cockroach';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { ExecutorState } from '../executors/executor-state';
var pg = require('pg');

describe('Test cockroach query executor', () => {


    let decryptionResult = { status: 0, data: 'plain password' };
    let mockedResult = {
        rows: [{
            job_id: "112345", status: 'successful'
        }], rowCount: 1
    };
    let mockConnectionTrackerService = {
        acquireDatasetStoreConnections: jest.fn().mockResolvedValue(6),
        releaseConnections: jest.fn(),
        releaseDatasetStoreConnections: jest.fn()
    };
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue(decryptionResult)
    };
    let connectionTrackerService;
    let authenticationService;
    let executorState = new ExecutorState();
    executorState.connections = [];
    executorState.datasets = [{}];
    executorState.queryFromGenerator = 'select bla from bla';
    let client;
    let cockroachQueryExecutorImpl;
    let clueSettingsProvider;
    let tenantDatasetDatabaseProvider;
    let clueSetting = {
        datasetDatabaseCACert : 'cert',
        datasetDatabaseRootUserKey: 'key',
        datasetDatabaseRootUserCert: 'cert2'
    };



    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: ConnectionTrackerService, useFactory: () => { return mockConnectionTrackerService } },
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
            ]
        }).compile();
        connectionTrackerService = await module.get<ConnectionTrackerService>(ConnectionTrackerService);
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);


        authenticationService.decryptPassword = jest.fn();
        clueSettingsProvider = {
            exec: jest.fn().mockImplementation(() => (clueSetting)),
            findOne: jest.fn().mockImplementation(() => (clueSettingsProvider)),
        };
        tenantDatasetDatabaseProvider = {
            exec: jest.fn().mockImplementation(() => ({tenantDatabaseName: 'tenant db'})),
            findOne: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
        };

        cockroachQueryExecutorImpl = new CockroachQueryExecutorImpl(executorState, connectionTrackerService, authenticationService, tenantDatasetDatabaseProvider, clueSettingsProvider);
        client = {
            connect: jest.fn(),
            query: jest.fn(),
            end: jest.fn(),
            release: jest.fn(),
            queryclient: jest.fn().mockImplementation(() => client),
        };

        let pool = {
            connect: jest.fn().mockImplementation(() => client),
            end: jest.fn(),
        }

        jest.genMockFromModule('pg');
        jest.mock('pg');
        pg.Pool = jest.fn().mockImplementation(() => pool);
    });

    it('execute a query successfully', async () => {
        authenticationService.decryptPassword.mockImplementation(() => decryptionResult).mockResolvedValue(decryptionResult);
        connectionTrackerService.acquireDatasetStoreConnections.mockImplementation(() => 5).mockResolvedValue(5);

        client.query = jest.fn().mockResolvedValueOnce(mockedResult).mockResolvedValueOnce(mockedResult);

        let result = await cockroachQueryExecutorImpl.executeQuery();
        expect(result).toEqual({ "status": 0, "data": [{ "job_id": "112345", "status": "successful" }] });
        expect(client.query).toHaveBeenCalled();

    });
});