import { Test } from '@nestjs/testing';

import oracledb = require('oracledb');
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { OracleConnectionTester } from '../connection.oracler-tester';



describe('Test oracle query connection tester', () => {
    let decryptionResult = {status: 0, data: 'plain password'};
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue(decryptionResult)
    };
    let authenticationService;
    let oracleConnMocked;
    let connection = {
        connectionInfo: {
            username: 'username',
            password: 'password',
            serverName: 'serverName', 
            serverPort: 'serverPort',
            serviceName: 'serviceName',
            connectionTimeout: 0
        }  
    };
    let mockedOracleQueryResult = {
        rows: [{
            job_id: "112345", status: 'successful'
        }], rowCount: 1
    };
    let executefun = jest.fn().mockReturnValue(Promise.resolve({name: 'success'}));
    let closefun = jest.fn().mockReturnValue(Promise.resolve({}));

    let oracleConnectionTester:OracleConnectionTester;


    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [                
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
            ]
        }).compile();
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);
        
        jest.genMockFromModule('oracledb');
        jest.mock('oracledb');

        oracleConnMocked = {
            getConnection: jest.fn(),
            execute: jest.fn().mockImplementation(() => mockedOracleQueryResult),
            close: jest.fn()
        };

        oracledb.getConnection = jest.fn().mockReturnValue(Promise.resolve({
            execute: executefun,
            close: closefun,
            oracleServerVersionString: '13456'
        }));
   
        oracleConnMocked.close.mockReturnValue({});

        oracleConnectionTester = new OracleConnectionTester(connection, authenticationService);
    });

    it('test testConnectionInternal scenario 1', async() => {

        oracleConnMocked.getConnection.mockReturnValue(Promise.resolve({oracleServerVersionString: '13456'}));
        oracleConnMocked.execute.mockReturnValue(Promise.resolve({name: 'success'}));

        let result = await oracleConnectionTester.testConnection();
        expect(result).toEqual({ result: 'Success', database: 'Oracle', info: { version: '13456' } });

        expect(oracledb.getConnection).toBeCalledTimes(1);
        expect(oracledb.getConnection).toBeCalledWith({"callTimeout": 0, "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=serverName)(PORT=serverPort))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))", "password": "plain password", "user": "username"});

        expect(executefun).toBeCalledTimes(1);
        expect(executefun).toBeCalledWith('SELECT * from DUAL');
        expect(closefun).toBeCalledTimes(1);
        expect(closefun).toBeCalledWith();

    });

    it('test testConnectionInternal scenario 2', async() => {

        executefun.mockReturnValue(Promise.reject('hello tester'));

        let result = await oracleConnectionTester.testConnection();
        expect(result).toEqual({ result: 'error', database: 'Oracle', dberror: 'hello tester' });

        expect(oracledb.getConnection).toBeCalledTimes(1);
        expect(oracledb.getConnection).toBeCalledWith({"callTimeout": 0, "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=serverName)(PORT=serverPort))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))", "password": "plain password", "user": "username"});

        expect(executefun).toBeCalledTimes(1);
        expect(executefun).toBeCalledWith('SELECT * from DUAL');
        expect(closefun).toBeCalledTimes(1);
        expect(closefun).toBeCalledWith();

    });

    it('test testConnectionInternal scenario 3', async() => {

        oracledb.getConnection.mockReturnValue(Promise.reject('hello tester'));

        let result = await oracleConnectionTester.testConnection();
        expect(result).toEqual({ result: 'error', database: 'Oracle', dberror: 'hello tester' });


    });







});