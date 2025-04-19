import { Test } from '@nestjs/testing';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { ExecutorState } from '../executors/executor-state';
import { OracleQueryExecutorImpl } from '../executors/executor-oracle';
import oracledb = require('oracledb');

describe('Test oracle query executor', () => {

    let mockConnectionTrackerService = {
        acquireDatasetStoreConnections: jest.fn().mockResolvedValue(6),
        releaseConnections: jest.fn().mockImplementation(() => 5).mockResolvedValue(5),
        releaseDatasetStoreConnections: jest.fn(),
        acquireConnections: jest.fn()
    };
    let oracleConnMocked;
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue({ status: 0, data: 'plain password' })
    };
    let mockedResult = {
        rows: [{
            job_id: "112345", status: 'successful'
        }], rowCount: 1
    };
    let decryptionResult = {status: 0, data: 'plain password'};
    let connectionTrackerService;
    let authenticationService;
    let oracleQueryExecutorImpl;
    let executorState = new ExecutorState();
    executorState.connections = [];
    executorState.datasets = [];
    executorState.queryFromGenerator = 'select bla from bla';
    executorState.connections.push(
        {
            connectionInfo: {
                username: 'username',
                password: 'password',
                serverName: 'serverName', 
                serverPort: 'serverPort',
                serviceName: 'serviceName',
                connectionTimeout: 0
            }  
        }
    );

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
        
        oracleQueryExecutorImpl = new OracleQueryExecutorImpl(executorState, connectionTrackerService, authenticationService, {}, {});
        
        jest.genMockFromModule('oracledb');
        jest.mock('oracledb');

        oracleConnMocked = {
            getConnection: jest.fn().mockImplementation(() => oracleConnMocked),
            execute: jest.fn().mockImplementation(() => mockedResult),
            close: jest.fn()
        };


    });

    it('execute a query successfully', async () => {
        authenticationService.decryptPassword.mockImplementation(() => decryptionResult).mockResolvedValue(decryptionResult);
        connectionTrackerService.acquireConnections.mockImplementation(() => 5).mockResolvedValue(5);

        let executefun = jest.fn().mockReturnValue(Promise.resolve(mockedResult));
        let closefun = jest.fn().mockReturnValue(Promise.resolve({}));
        oracledb.getConnection = jest.fn().mockReturnValue(Promise.resolve({
            execute: executefun,
            close: closefun
        }));
   
        oracleConnMocked.close.mockReturnValue({});

        let result = await oracleQueryExecutorImpl.executeQuery();
        expect(result).toEqual({ status: 0, data: [ { job_id: '112345', status: 'successful' } ] });
    });

});