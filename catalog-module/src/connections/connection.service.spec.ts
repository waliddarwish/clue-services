import { Test } from '@nestjs/testing';
import { ConnectionTestService } from '../../../connection-test-module/src/connection-test.service';
import { DataSourceConnectionService } from './connection.service';


describe("Test DataSourceConnectionService ", () => {
    let dsConnectionModel;
    let connectionTestService;
    let connectionTestServiceMocked = {
        testConnection: jest.fn()
    };
    let dataSourceConnectionService;



    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: ConnectionTestService, useFactory: () => { return connectionTestServiceMocked } },

            ]
        }).compile();

        //dsConnectionModel = jest.fn().mockImplementation(()=> {dsConnectionModelMocked});

        dsConnectionModel = {
            find: jest.fn().mockImplementation(() => (dsConnectionModel)),
            findOne: jest.fn().mockImplementation(() => (dsConnectionModel)),
            findOneAndUpdate: jest.fn().mockImplementation(() => (dsConnectionModel)),
            deleteOne: jest.fn().mockImplementation(() => (dsConnectionModel)),
            deleteMany: jest.fn().mockImplementation(() => (dsConnectionModel)),
            sort: jest.fn().mockImplementation(() => (dsConnectionModel)),
            limit: jest.fn().mockImplementation(() => (dsConnectionModel)),
            exec: jest.fn()
        };
        connectionTestService = await module.get<ConnectionTestService>(ConnectionTestService);
        dataSourceConnectionService = new DataSourceConnectionService(dsConnectionModel, connectionTestService);
    });


    it ('test findDataSourceConnectionById' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.findDataSourceConnectionById('id');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test deleteConnectionById' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.deleteConnectionById('id');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test updateConnection' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.updateConnection('id', {});
        expect(result).toEqual({name: 'hello'});
    });


    it ('test findDataSourceConnectionByUserId' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.findDataSourceConnectionByUserId('id');
        expect(result).toEqual({name: 'hello'});
    });


    it ('test findDataSourceConnectionByTenantId' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.findDataSourceConnectionByTenantId('id');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test searchDataSourceConnection' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.searchDataSourceConnection('id', 'tenantId');
        expect(result).toEqual({name: 'hello'});
    });



    it ('test testDataSourceConnection with no timeout' , async () => {
        let requestBody = {
            connectionInfo: {}
        };
        connectionTestService.testConnection.mockReturnValueOnce(Promise.resolve(requestBody));
        let result = await dataSourceConnectionService.testDataSourceConnection(requestBody);
        expect(result).toEqual(requestBody);
        expect(result.connectionInfo.connectionTimeout).toEqual(60000);
    });

    it ('test testDataSourceConnectionById with with timeout' , async () => {
        let requestBody = {
            connectionInfo: {connectionTimeout: 15}
        };
        connectionTestService.testConnection.mockReturnValueOnce(Promise.resolve(requestBody));
        let result = await dataSourceConnectionService.testDataSourceConnection(requestBody);
        expect(result).toEqual(requestBody);
        expect(result.connectionInfo.connectionTimeout).toEqual(15);
    });


    it ('test testDataSourceConnectionById without timeout' , async () => {
        let requestBody = {
            connectionInfo: {}
        };
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(requestBody));

        connectionTestService.testConnection.mockReturnValueOnce(Promise.resolve(requestBody));
        let result = await dataSourceConnectionService.testDataSourceConnectionById('');
        expect(result).toEqual(requestBody);
        expect(result.connectionInfo.connectionTimeout).toEqual(60000);
    });

    it ('test testDataSourceConnectionById with timeout' , async () => {
        let requestBody = {
            connectionInfo: {connectionTimeout: 15}
        };
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(requestBody));

        connectionTestService.testConnection.mockReturnValueOnce(Promise.resolve(requestBody));
        let result = await dataSourceConnectionService.testDataSourceConnectionById('');
        expect(result).toEqual(requestBody);
        expect(result.connectionInfo.connectionTimeout).toEqual(15);
    });

    it ('test testDataSourceConnection with null result' , async () => {

        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(null));

        let result = await dataSourceConnectionService.testDataSourceConnectionById('');
        expect(result).toEqual({ result: 'Database connection not found'});
    });


    it ('test getRecentConnections' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.getRecentConnections('id', 'tenantId');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test deleteConnections' , async () => {
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await dataSourceConnectionService.deleteConnections('userId');
        expect(result).toEqual({name: 'hello'});
    });

    describe('it test createDataSourceConnection', () => {
        let dsConnectionModelMocked = {
            id: '',
            userId: '',
            tenantId: '',
            lastAccess: '', 
        };
        beforeEach(async () => {
            dsConnectionModel = jest.fn().mockImplementation(()=> {
                return {
                    newConnection : jest.fn().mockImplementation(() => { return dsConnectionModelMocked }),
                    save: jest.fn().mockReturnValue(Promise.resolve(dsConnectionModelMocked)),
                    findOneAndUpdate: jest.fn().mockReturnValue(dsConnectionModel),
                    exec: jest.fn().mockReturnValueOnce(Promise.resolve({name: 'hello'}))
                }
            });
            dataSourceConnectionService = new DataSourceConnectionService(dsConnectionModel, connectionTestService);

        });

        it ('test createDataSourceConnection' , async () => {
            let result = await dataSourceConnectionService.createDataSourceConnection({}, 'userid', 'tenantid');
            expect(result.userId).toEqual(dsConnectionModelMocked.userId);
            expect(result.tenantId).toEqual(dsConnectionModelMocked.tenantId);
        });
    });



});