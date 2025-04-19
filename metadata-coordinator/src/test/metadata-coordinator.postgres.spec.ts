import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { MetadataImportingService } from '../../../metadata-importing-module/src/metadata-importing.service';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { ProgresMetadataCoordinator } from '../coordinators/metadata-coordinator.postgres';

describe('Test ProgresMetadataCoordinator', () => {
    let connection;
    let decryptionResult = {status: 0, data: 'plain password'};
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue(decryptionResult)
    };
    let authenticationService;
    let metadataImportingService;
    let metadataImportingServiceMocked = {};
    let connectionTrackerService;
    let connectionTrackerServiceMocked = {};
    let dsConnectionModel;
    let metadataTrackerProvider;
    let mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
      };
    let queryResult = {
        rows: []
    };
    let postgresMetadataCoordinator : ProgresMetadataCoordinator;



  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useFactory: () => {
            return mockAuthenticationService;
          },
        },
        {
          provide: MetadataImportingService,
          useFactory: () => {
            return metadataImportingServiceMocked;
          },
        },
        {
          provide: ConnectionTrackerService,
          useFactory: () => {
            return connectionTrackerServiceMocked;
          },
        },
      ],
    }).compile();
    authenticationService = await module.get<AuthenticationService>(
      AuthenticationService,
    );
    metadataImportingService = await module.get<MetadataImportingService>(
      MetadataImportingService,
    );
    connectionTrackerService = await module.get<ConnectionTrackerService>(
      ConnectionTrackerService,
    );
    dsConnectionModel = {
      exec: jest.fn(),
      findOne: jest.fn().mockImplementation(() => dsConnectionModel),
    };
    metadataTrackerProvider = {
      exec: jest.fn(),
      updateMany: jest.fn().mockImplementation(() => metadataTrackerProvider),
    };
    connection = {
        id: 'connId',
        connectionInfo: {
          username: 'username',
          serverName: '192.168.0.1',
          serviceName: 'serviceName',
          password: 'password',
          serverPort: 45,
          connectionTimeout: 'connectionTimeout',
        },
      };

    postgresMetadataCoordinator = new ProgresMetadataCoordinator(connection, authenticationService, metadataImportingService, connectionTrackerService, metadataTrackerProvider);
});
    it('test getSchemaObjects scenario 1', async() => {
        let createNewClientMocked = ProgresMetadataCoordinator.prototype.createNewClient = jest
        .fn()
        .mockImplementation(() => mClient)
        .mockReturnValue(mClient);
        let schemaName = 'dvd_rentals';

        mClient.connect.mockReturnValueOnce(Promise.resolve(mClient));
        mClient.query.mockReturnValueOnce(Promise.resolve(queryResult));


        let result = await postgresMetadataCoordinator.getSchemaObjects(schemaName);
        expect(result).toEqual({ result: 'Success', data: queryResult.rows });

        expect(mockAuthenticationService.decryptPassword).toBeCalledTimes(1);
        expect(mockAuthenticationService.decryptPassword).toBeCalledWith("password");

        expect(mClient.connect).toBeCalledTimes(1);
        expect(mClient.connect).toBeCalledWith();
    
        expect(mClient.query).toBeCalledTimes(1);
        expect(mClient.query).toBeCalledWith("SELECT table_name as object_name ,  (CASE WHEN table_type = 'BASE TABLE' THEN 'TABLE' ELSE table_type END) as Object_type FROM information_schema.tables where table_schema = $1", ["dvd_rentals"]);
     
        expect(mClient.end).toBeCalledTimes(1);
        expect(mClient.end).toBeCalledWith();
    });


    it('test executeMetadataSQLStatement', async() => {
        let createNewClientMocked = ProgresMetadataCoordinator.prototype.createNewClient = jest
        .fn()
        .mockImplementation(() => mClient)
        .mockReturnValue(mClient);
        let schemaName = 'dvd_rentals';

        mClient.connect.mockReturnValueOnce(Promise.resolve(mClient));
        mClient.query.mockReturnValueOnce(Promise.resolve(queryResult));


        let result = await postgresMetadataCoordinator.executeMetadataSQLStatement('query', 'schemaName');
        expect(result).toEqual({ result: 'Success', data: queryResult.rows });

        expect(mClient.connect).toBeCalledTimes(1);
        expect(mClient.connect).toBeCalledWith();
    
        expect(mClient.query).toBeCalledTimes(1);
        expect(mClient.query).toBeCalledWith('query', ["schemaName"]);
     
        expect(mClient.end).toBeCalledTimes(1);
        expect(mClient.end).toBeCalledWith();
    });

    it('test executeMetadataSQLStatement scenario 2', async() => {
        let createNewClientMocked = ProgresMetadataCoordinator.prototype.createNewClient = jest
        .fn()
        .mockImplementation(() => mClient)
        .mockReturnValue(mClient);
        let schemaName = 'dvd_rentals';

        mClient.connect.mockReturnValueOnce(Promise.resolve(mClient));
        mClient.query.mockReturnValueOnce(Promise.reject('error'));


        let result = await postgresMetadataCoordinator.executeMetadataSQLStatement('query', 'schemaName');
        expect(result).toEqual({ result: 'error', dberror: 'error' });

        expect(mClient.connect).toBeCalledTimes(1);
        expect(mClient.connect).toBeCalledWith();
    
        expect(mClient.query).toBeCalledTimes(1);
        expect(mClient.query).toBeCalledWith('query', ["schemaName"]);
     
        expect(mClient.end).toBeCalledTimes(1);
        expect(mClient.end).toBeCalledWith();
    });

});