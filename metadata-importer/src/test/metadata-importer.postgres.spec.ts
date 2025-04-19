import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { PostgresMetadataImporter } from '../importers/metadata-importer.postgres';
jest.mock('uuid/v4');  // <= auto-mock uuid/v4
import uuidv4 = require('uuid/v4');

let query =
  " SELECT c.table_schema , c.table_name, t.table_type , c.column_name, c.data_type,  coalesce(c.character_maximum_length, 0) as character_maximum_length,  coalesce(c.numeric_precision, 0) as numeric_precision,  coalesce(c.numeric_scale, 0) as numeric_scale,  q1.source_schema, q1.source_table, q1.foreign_table_schema, q1.foreign_table_name, q1.foreign_column_name, q1.constraint_type  FROM information_schema.\"columns\" As c  JOIN information_schema.tables t on  c.table_catalog = t.table_catalog  AND c.table_schema = t.table_schema  AND c.table_name = t.table_name  left outer join  (SELECT  tc.table_schema as source_schema,  tc.constraint_name,  tc.constraint_type as constraint_type,  tc.table_name as source_table,  kcu.column_name as source_column,  ccu.table_schema AS foreign_table_schema,  ccu.table_name AS foreign_table_name,  ccu.column_name AS foreign_column_name   FROM   information_schema.table_constraints AS tc   JOIN information_schema.key_column_usage AS kcu  ON tc.constraint_name = kcu.constraint_name  AND tc.table_schema = kcu.table_schema  JOIN information_schema.constraint_column_usage AS ccu  ON ccu.constraint_name = tc.constraint_name  AND ccu.table_schema = tc.table_schema  where tc.table_catalog = 'serviceName' and tc.table_schema in ('public')  ) as q1 on  c.table_schema = q1.source_schema  and c.table_name = q1.source_table  and c.column_name = q1.source_column  WHERE c.table_catalog =  'serviceName' AND t.table_type IN('BASE TABLE' , 'VIEW')  and c.table_name in ('tableName')  and t.table_schema in ('public')  ORDER BY c.table_schema, c.table_name";
describe('Test PostgresMetadataImporter', () => {
  let connection = {
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
  let metadataTrackerProvider;
  let modelObjectProvider;

  let decryptionResult = { status: 0, data: 'plain password' };
  let mockAuthenticationService = {
    decryptPassword: jest.fn().mockResolvedValue(decryptionResult),
  };
  let authenticationService;

  let mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  let postgresMetadataImporter: PostgresMetadataImporter;

  let objects;
  objects = [
    {
      objectName: 'public.tableName',
    },
  ];
  let queryResult = {
    rows: [
      {
        table_schema: 'public',
        table_type: 'BASE TABLE',
        table_name: 'tableName',
        column_name: 'Test ID',
        data_type: 'name',
        character_maximum_length: 19,
        numeric_precision: 10,
        numeric_scale: 12,
        source_schema: 'source_schema',
        source_table: 'source_table',
        foreign_table_schema: 'foreign_table_schema',
        foreign_table_name: 'foreign_table_name',
        foreign_column_name: 'foreign_column_name',
        constraint_type: 'PRIMARY KEY',
      },
      {
        table_schema: 'public',
        table_type: 'Not a table',
        table_name: 'table  Name',
        column_name: 'Test ID',
        data_type: 'name',
        character_maximum_length: 19,
        numeric_precision: 10,
        numeric_scale: 12,
        source_schema: 'source_schema',
        source_table: 'source_table',
        foreign_table_schema: 'foreign_table_schema',
        foreign_table_name: 'foreign_table_name',
        foreign_column_name: 'foreign_column_name',
        constraint_type: 'PRIMARY KEY',
      },
    ],
  };

  const mockedUUIDv4 = uuidv4 as jest.Mocked<typeof uuidv4>; 

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
      ],
    }).compile();
    authenticationService = await module.get<AuthenticationService>(
      AuthenticationService,
    );
    modelObjectProvider = jest.fn().mockImplementation(() => {
      return {
        newObj: jest.fn().mockImplementation(() => {
          return {};
        }),
        save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
      };
    });
    metadataTrackerProvider = {
      updateMany: jest.fn().mockImplementation(() => {
        return metadataTrackerProvider;
      }),
      updateOne: jest.fn().mockImplementation(() => {
        return metadataTrackerProvider;
      }),
      exec: jest.fn(),
    };

    postgresMetadataImporter = new PostgresMetadataImporter(
      connection,
      authenticationService,
      modelObjectProvider,
      metadataTrackerProvider,
    );

    mockedUUIDv4.mockReturnValue('uuidv4');  // <= use the properly typed mock


  });




  it('test importObjectInternal scenario 1', async () => {

    let createNewClientMocked = (PostgresMetadataImporter.prototype.createNewClient = jest
      .fn()
      .mockImplementation(() => mClient)
      .mockReturnValue(mClient));
    mClient.connect.mockReturnValue(Promise.resolve(mClient));
    mClient.query.mockReturnValue(Promise.resolve(queryResult));
    metadataTrackerProvider.exec.mockReturnValue(
      Promise.resolve({ name: 'metadataTrackerProviderExec' }),
    );

    let result = await postgresMetadataImporter.importObject(
      'modelId',
      objects,
      'userId',
      'tenantId',
      'trackerId',
    );
    expect(result).toEqual(undefined);
    expect(createNewClientMocked).toBeCalledTimes(1);
    expect(createNewClientMocked).toBeCalledWith(connection);
    expect(mClient.connect).toBeCalledTimes(1);
    expect(mClient.connect).toBeCalledWith();

    expect(mClient.query).toBeCalledTimes(1);
    expect(mClient.query).toBeCalledWith(query);

    expect(modelObjectProvider).toBeCalledTimes(2);
    expect(modelObjectProvider).toHaveBeenCalledWith(
      {
        clueModelId: 'modelId',
        dataSourceConnectionId: 'connId',
        id: 'uuidv4',
        modelObjectItems: [
          {
            columnName: 'Test ID',
            constraintType: 'PRIMARY KEY',
            dataLength: 19,
            dataTypeInDataSource: 'name',
            decimalPoints: 12,
            defaultAggregation: 'Count',
            foreignTableColumnName: 'foreign_column_name',
            foreignTableName: 'foreign_table_name',
            foreignTableSchema: 'foreign_table_schema',
            isForeignKey: false,
            isPrimaryKey: true,
            modelObjectItemId: 'uuidv4',
            nameInDatasource: 'public.tableName.Test ID',
            precisionInDataSource: 10,
            prettyName: 'Test ID',
            sourceSchema: 'source_schema',
            sourceTable: 'source_table',
            usage: 'Dimension',
            usageType: 'Text',
          },
        ],
        name: 'tableName',
        nameInDatasource: 'public.tableName',
        schemata: 'public',
        source: 'Database',
        tenantId: 'tenantId',
        type: 'TABLE',
        userId: 'userId',
      }
    );

    expect(mClient.end).toBeCalledTimes(1);
    expect(mClient.end).toBeCalledWith();
  });


  it('test importObjectInternal scenario 2', async () => {

    let createNewClientMocked = (PostgresMetadataImporter.prototype.createNewClient = jest
      .fn()
      .mockImplementation(() => mClient)
      .mockReturnValue(mClient));
    mClient.connect.mockReturnValue(Promise.resolve(mClient));
    mClient.query.mockReturnValue(Promise.resolve(queryResult));
    metadataTrackerProvider.exec.mockReturnValue(
      Promise.resolve({ name: 'metadataTrackerProviderExec' }),
    );

    let result = await postgresMetadataImporter.importObject(
      'modelId',
      objects,
      'userId',
      'tenantId',
      'trackerId',
    );
    expect(result).toEqual(undefined);
    expect(createNewClientMocked).toBeCalledTimes(1);
    expect(createNewClientMocked).toBeCalledWith(connection);
    expect(mClient.connect).toBeCalledTimes(1);
    expect(mClient.connect).toBeCalledWith();

    expect(mClient.query).toBeCalledTimes(1);
    expect(mClient.query).toBeCalledWith(query);

    expect(modelObjectProvider).toBeCalledTimes(2);
    expect(modelObjectProvider).toHaveBeenCalledWith(
        {"clueModelId": "modelId", "dataSourceConnectionId": "connId", "id": "uuidv4", "modelObjectItems": [{"columnName": "Test ID", "constraintType": "PRIMARY KEY", "dataLength": 19, "dataTypeInDataSource": "name", "decimalPoints": 12, "defaultAggregation": "Count", "foreignTableColumnName": "foreign_column_name", "foreignTableName": "foreign_table_name", "foreignTableSchema": "foreign_table_schema", "isForeignKey": false, "isPrimaryKey": true, "modelObjectItemId": "uuidv4", "nameInDatasource": "public.table  Name.Test ID", "precisionInDataSource": 10, "prettyName": "Test ID", "sourceSchema": "source_schema", "sourceTable": "source_table", "usage": "Dimension", "usageType": "Text"}], "name": "table  Name", "nameInDatasource": "public.table  Name", "schemata": "public", "source": "Database", "tenantId": "tenantId", "type": "VIEW", "userId": "userId"}
    );

    expect(mClient.end).toBeCalledTimes(1);
    expect(mClient.end).toBeCalledWith();
  });


});
