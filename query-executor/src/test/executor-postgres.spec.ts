import { Test } from '@nestjs/testing';

import { PostgresQueryExecutorImpl } from '../executors/executor-postgres';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { ExecutorState } from '../executors/executor-state';


describe('Test postgres query executor', () => {


    let decryptionResult = {status: 0, data: 'plain password'};
    let mockedResult = { rows: [{
        job_id: "112345", status: 'successful'
    }], rowCount: 1 };
    let mockConnectionTrackerService = {
        acquireConnections: jest.fn().mockResolvedValue(6),
        releaseConnections: jest.fn()
    };
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue(decryptionResult)
    };
    let connectionTrackerService;
    let authenticationService;
    let postgresQueryExecutorImpl;
    let executorState = new ExecutorState();
    let connections = [];
    let connection = {connectionInfo: {
        username: 'username', 
        serverName: '192.168.0.1',
        serviceName: 'serviceName',
        password: 'password',
        serverPort: 45,
        connectionTimeout: 'connectionTimeout'
    }};
    connections.push(connection);
    executorState.connections = connections;
    executorState.queryFromGenerator = 'select bla from bla';
    let  client = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
        release: jest.fn(), 
        queryclient: jest.fn().mockImplementation(()=> client),
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
          
        postgresQueryExecutorImpl = new PostgresQueryExecutorImpl(executorState, connectionTrackerService, authenticationService, {}, {});
        
    });
    /**
     *         jest.genMockFromModule('pg');
        jest.mock('pg', () => {
            return { Client: jest.fn().mockImplementation(() => client) };
        });
     */

    it('execute a query successfully', async () => {        
        authenticationService.decryptPassword.mockImplementation(() => decryptionResult).mockResolvedValue(decryptionResult);
        connectionTrackerService.acquireConnections.mockImplementation(() => 5).mockResolvedValue(5);

        PostgresQueryExecutorImpl.prototype.createNewClient = jest.fn().mockImplementation(() => client).mockReturnValue(client);
        client.connect.mockResolvedValueOnce(client);
        client.query = jest.fn().mockResolvedValueOnce(mockedResult);
        let result = await postgresQueryExecutorImpl.executeQuery();
        expect(result).toEqual({"status":0,"data":[{"job_id":"112345","status":"successful"}]});
        expect(client.connect).toHaveBeenCalled();
        expect(client.query).toHaveBeenCalled();
        expect(client.end).toHaveBeenCalled();

    });
});