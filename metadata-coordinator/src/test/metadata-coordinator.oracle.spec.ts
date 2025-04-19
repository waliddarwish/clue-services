import { Test } from '@nestjs/testing';
jest.mock('oracledb');
import oracledb = require('oracledb');
import { OracleMetadataCoordinator } from '../coordinators/metadata-coordinator.oracle';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { MetadataImportingService } from '../../../metadata-importing-module/src/metadata-importing.service';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';

describe('OracleMetadataCoordinator test', () => {
  let connection;
  let decryptionResult = { status: 0, data: 'plain password' };
  let mockAuthenticationService = {
    decryptPassword: jest.fn().mockResolvedValue(decryptionResult),
  };
  let authenticationService;
  let metadataImportingService;
  let metadataImportingServiceMocked = {};
  let connectionTrackerService;
  let connectionTrackerServiceMocked = {};
  let dsConnectionModel;
  let metadataTrackerProvider;

  let oracleMetadataCoordinator: OracleMetadataCoordinator;

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

    oracleMetadataCoordinator = new OracleMetadataCoordinator(
      connection,
      authenticationService,
      metadataImportingService,
      connectionTrackerService,
      metadataTrackerProvider,
    );

    oracledb.getConnection = jest
      .fn()
      .mockReturnValue(Promise.resolve(oracledb));
    oracledb.execute = jest.fn();
    oracledb.close = jest.fn();
  });

  it('test getSchemaObjects ', async () => {
    let schemaName = 'car_bmw';
    oracledb.execute.mockReturnValue(Promise.resolve({rows: []}));
    let result = await oracleMetadataCoordinator.getSchemaObjects(schemaName)
    expect(result).toEqual({ result: 'Success', data: []});

    expect(mockAuthenticationService.decryptPassword).toBeCalledTimes(1);
    expect(mockAuthenticationService.decryptPassword).toBeCalledWith("password");

    expect(oracledb.close).toBeCalledTimes(1);
    expect(oracledb.close).toBeCalledWith();

    expect(oracledb.getConnection).toBeCalledTimes(1);
    expect(oracledb.getConnection).toBeCalledWith({"callTimeout": "connectionTimeout", "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.1)(PORT=45))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))", "password": "plain password", "user": "username"});

    expect(oracledb.execute).toBeCalledTimes(1);
    expect(oracledb.execute).toBeCalledWith("Select OBJECT_NAME, OBJECT_TYPE from user_objects where object_type in ('TABLE', 'VIEW')");
  });

  it('test getSchemaObjects scenario 2', async () => {
    let schemaName = 'car_bmw';
    oracledb.execute.mockReturnValue(Promise.reject('oracledb error'));
    let result = await oracleMetadataCoordinator.getSchemaObjects(schemaName)
    expect(result).toEqual({ result: 'error', database: 'Oracle', dberror: 'oracledb error' });

    expect(mockAuthenticationService.decryptPassword).toBeCalledTimes(1);
    expect(mockAuthenticationService.decryptPassword).toBeCalledWith("password");

    expect(oracledb.close).toBeCalledTimes(1);
    expect(oracledb.close).toBeCalledWith();

    expect(oracledb.getConnection).toBeCalledTimes(1);
    expect(oracledb.getConnection).toBeCalledWith({"callTimeout": "connectionTimeout", "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.1)(PORT=45))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))", "password": "plain password", "user": "username"});

    expect(oracledb.execute).toBeCalledTimes(1);
    expect(oracledb.execute).toBeCalledWith("Select OBJECT_NAME, OBJECT_TYPE from user_objects where object_type in ('TABLE', 'VIEW')");
  });

  it('test getSchema ', async () => {
    let schemaName = 'car_bmw';
    oracledb.execute.mockReturnValue(Promise.resolve({rows: []}));
    let result = await oracleMetadataCoordinator.getSchemas()
    expect(result).toEqual({ result: 'Success', data: []});

    expect(mockAuthenticationService.decryptPassword).toBeCalledTimes(1);
    expect(mockAuthenticationService.decryptPassword).toBeCalledWith("password");

    expect(oracledb.close).toBeCalledTimes(1);
    expect(oracledb.close).toBeCalledWith();

    expect(oracledb.getConnection).toBeCalledTimes(1);
    expect(oracledb.getConnection).toBeCalledWith({"callTimeout": "connectionTimeout", "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.1)(PORT=45))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))", "password": "plain password", "user": "username"});

    expect(oracledb.execute).toBeCalledTimes(1);
    expect(oracledb.execute).toBeCalledWith('SELECT USERNAME AS schema_name FROM ALL_USERS');
  });

  it('test getSchema scenario 2', async () => {
    let schemaName = 'car_bmw';
    oracledb.execute.mockReturnValue(Promise.reject('oracledb error'));
    let result = await oracleMetadataCoordinator.getSchemas()
    expect(result).toEqual({ result: 'error', database: 'Oracle', dberror: 'oracledb error' });

    expect(mockAuthenticationService.decryptPassword).toBeCalledTimes(1);
    expect(mockAuthenticationService.decryptPassword).toBeCalledWith("password");

    expect(oracledb.close).toBeCalledTimes(1);
    expect(oracledb.close).toBeCalledWith();

    expect(oracledb.getConnection).toBeCalledTimes(1);
    expect(oracledb.getConnection).toBeCalledWith({"callTimeout": "connectionTimeout", "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.1)(PORT=45))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))", "password": "plain password", "user": "username"});

    expect(oracledb.execute).toBeCalledTimes(1);
    expect(oracledb.execute).toBeCalledWith('SELECT USERNAME AS schema_name FROM ALL_USERS');
  });
});
