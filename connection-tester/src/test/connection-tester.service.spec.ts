
import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { ConnectionTesterService } from '../connection-tester.service';
import connectionTesterFactory = require('../connection.tester-factory');
import { exec } from 'child_process';


describe('Test connection tester service', () => {
    let mockAuthenticationService = {};
    let authenticationService;
    let connectionTesterService;
    let mockedFactory = {
        testConnection: jest.fn()
    };
    let connection = {
        connectionType: 'bedengan'
    };


    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [            
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
            ]
        }).compile();
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);
        connectionTesterService = new ConnectionTesterService(authenticationService);
        
        jest.genMockFromModule('../connection.tester-factory');
        jest.mock('../connection.tester-factory');

    });

    it('test testConnection scenario 1', async () => {
        connectionTesterFactory.default = jest.fn().mockReturnValueOnce(mockedFactory);
        mockedFactory.testConnection.mockReturnValueOnce(Promise.resolve({name: 'connection tested'}));
        let result = await connectionTesterService.testConnection(connection);
        expect(result).toEqual({name: 'connection tested'});
        
        expect(mockedFactory.testConnection).toBeCalledTimes(1);
        expect(mockedFactory.testConnection).toBeCalledWith();
    });

    it('test testConnection scenario 2', async () => {
        connectionTesterFactory.default = jest.fn().mockReturnValueOnce(null);
        let result = await connectionTesterService.testConnection(connection);
        expect(result).toEqual({ result : 'Unknown Connection type' + connection.connectionType});

    });

    it('test testConnection scenario 3', async () => {
        connectionTesterFactory.default = jest.fn().mockReturnValueOnce(mockedFactory);
        mockedFactory.testConnection.mockReturnValueOnce(Promise.reject({name: 'connection rejected'}));
        let result = await connectionTesterService.testConnection(connection);
        expect(result).toEqual({"error": {"name": "connection rejected"}, "result": "Internal Error"});
        
        expect(mockedFactory.testConnection).toBeCalledTimes(1);
        expect(mockedFactory.testConnection).toBeCalledWith();
    });

});