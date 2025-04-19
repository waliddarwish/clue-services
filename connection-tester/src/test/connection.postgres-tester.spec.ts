import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { PostgresConnectionTester } from '../connection.postgres-tester';

describe('Test postgres connection tester', () => {
    

    let connection = {connectionInfo: {
        username: 'username', 
        serverName: '192.168.0.1',
        serviceName: 'serviceName',
        password: 'password',
        serverPort: 45,
        connectionTimeout: 'connectionTimeout'
    }};


    let decryptionResult = {status: 0, data: 'plain password'};
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue(decryptionResult)
    };
    let authenticationService;

    let mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
      };
    
    let postgresConnectionTester:PostgresConnectionTester;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
            ]
        }).compile();

        authenticationService = await module.get<AuthenticationService>(AuthenticationService);

        postgresConnectionTester = new PostgresConnectionTester(connection, authenticationService);
    
        
    });

    afterEach(async () => {

    });

    it('test testConnectionInternal scenario 1', async () => {

        mClient.connect.mockReturnValue(Promise.resolve(mClient));
        mClient.query.mockReturnValue(Promise.resolve({rows: [{version: '1.0.1'}]}));
        let createNewConnectionMocked = PostgresConnectionTester.prototype.createNewClient = jest.fn().mockImplementation(() => mClient).mockReturnValue(mClient);

        let result = await postgresConnectionTester.testConnection();
        expect(result).toEqual({ result: 'Success', database: 'Postgres', info: { version: '1.0.1' } });
        
        expect(createNewConnectionMocked).toBeCalledTimes(1);
        expect(createNewConnectionMocked).toBeCalledWith(connection);

        expect(mClient.connect).toBeCalledTimes(1);
        expect(mClient.connect).toBeCalledWith();
        expect(mClient.query).toBeCalledTimes(1);
        expect(mClient.query).toBeCalledWith('SELECT VERSION()');
        expect(mClient.end).toBeCalledTimes(1);
        expect(mClient.end).toBeCalledWith();
    });

    it('test testConnectionInternal scenario 2', async () => {

        mClient.connect.mockReturnValue(Promise.resolve(mClient));
        mClient.query.mockReturnValue(Promise.reject('its not working'));
        let createNewConnectionMocked = PostgresConnectionTester.prototype.createNewClient = jest.fn().mockImplementation(() => mClient).mockReturnValue(mClient);

        let result = await postgresConnectionTester.testConnection();
        expect(result).toEqual({ result: 'error', dberror: 'its not working' });
        
        expect(createNewConnectionMocked).toBeCalledTimes(1);
        expect(createNewConnectionMocked).toBeCalledWith(connection);

        expect(mClient.connect).toBeCalledTimes(1);
        expect(mClient.connect).toBeCalledWith();
        expect(mClient.query).toBeCalledTimes(1);
        expect(mClient.query).toBeCalledWith('SELECT VERSION()');
        expect(mClient.end).toBeCalledTimes(1);
        expect(mClient.end).toBeCalledWith();
    });


});