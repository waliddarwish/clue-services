import { Test } from '@nestjs/testing';

jest.mock('oracledb');
import oracledb = require('oracledb');
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
jest.mock('uuid/v4'); // <= auto-mock uuid/v4
import uuidv4 = require('uuid/v4');
import { OracleMetadataImporter } from '../importers/metadata-importer.oracle';

describe('test OracleMetadataImporter', () => {
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
  let objects;
  objects = [
    {
      objectName: 'public.tableName',
    },
  ];
  let metadataTrackerProvider;
  let modelObjectProvider;

  let decryptionResult = { status: 0, data: 'plain password' };
  let mockAuthenticationService = {
    decryptPassword: jest.fn().mockResolvedValue(decryptionResult),
  };
  let authenticationService;
  const mockedUUIDv4 = uuidv4 as jest.Mocked<typeof uuidv4>;

  let oracleMetadataImporter: OracleMetadataImporter;

  let queryResult = {
    rows: [
      {
        OWNER: 'dvd_rentals',
        OBJECT_TYPE: 'column_table',
        DATA_TYPE: 'VARCHAR2',
        COLUMN_NAME: 'customer_ID',
        OBJECT_NAME: 'customer_table',
        DATA_LENGTH: 20,
        DATA_PRECISION: 21,
        DATA_SCALE: 22,
        SOURCE_OWNER: 'SOURCE_OWNER',
        FK_OWNER: 'FK_OWNER',
        FK_TABLE: 'FK_TABLE',
        FK_OWNER_COLUMN: 'FK_OWNER_COLUMN',
        FK_PK_TYPE: 'P',
      },

      {
        OWNER: 'dvd_rentals',
        OBJECT_TYPE: 'column_table',
        DATA_TYPE: 'VARCHAR2',
        COLUMN_NAME: 'sales_name',
        OBJECT_NAME: 'Sales_table',
        DATA_LENGTH: 20,
        DATA_PRECISION: 21,
        DATA_SCALE: 22,
        SOURCE_OWNER: 'SOURCE_OWNER',
        FK_OWNER: 'FK_OWNER',
        FK_TABLE: 'FK_TABLE',
        FK_OWNER_COLUMN: 'FK_OWNER_COLUMN',
        FK_PK_TYPE: 'R',
      },
    ],
  };

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

    oracledb.getConnection = jest
      .fn()
      .mockReturnValue(Promise.resolve(oracledb));
    oracledb.execute = jest.fn();
    oracledb.close = jest.fn();

    mockedUUIDv4.mockReturnValue('uuidv4');

    oracleMetadataImporter = new OracleMetadataImporter(
      connection,
      authenticationService,
      modelObjectProvider,
      metadataTrackerProvider,
    );
  });

  it('Test import objects', async () => {
    metadataTrackerProvider.exec.mockReturnValue(
      Promise.resolve({ name: 'metadataTrackerProviderExec' }),
    );
    oracledb.execute.mockReturnValue(Promise.resolve(queryResult));
    let result = await oracleMetadataImporter.importObject(
      'modelId',
      objects,
      'userId',
      'tenantId',
      'trackerId',
    );

    expect(result).toEqual(undefined);

    expect(oracledb.getConnection).toBeCalledTimes(1);
    expect(oracledb.getConnection).toBeCalledWith({
      callTimeout: 'connectionTimeout',
      connectString:
        '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.1)(PORT=45))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=serviceName)))',
      password: 'plain password',
      user: 'username',
    });

    expect(oracledb.execute).toBeCalledTimes(1);
    expect(oracledb.execute).toBeCalledWith(
      "            SELECT            UO.OWNER AS OWNER,            UO.OBJECT_NAME AS OBJECT_NAME,            UO.OBJECT_TYPE AS OBJECT_TYPE,            UTC.COLUMN_NAME AS COLUMN_NAME,            UTC.DATA_TYPE AS DATA_TYPE ,            UTC.DATA_LENGTH AS DATA_LENGTH,            NVL(UTC.DATA_PRECISION, 0) AS DATA_PRECISION,            NVL(UTC.DATA_SCALE, 0) AS DATA_SCALE,            Q1.OWNER AS SOURCE_OWNER,            Q1.CONSTRAINT_NAME AS FK_PK,            Q1.CONSTRAINT_TYPE AS FK_PK_TYPE,            Q1.R_CONSTRAINT_NAME AS FK,            Q2.R_OWNER AS FK_OWNER,            Q2.R_TABLE_NAME AS FK_TABLE,            Q2.r_column_name AS FK_COLUMN            FROM                (ALL_OBJECTS UO INNER JOIN 		ALL_TAB_COLUMNS UTC 		ON(UO.OBJECT_NAME = UTC.TABLE_NAME AND UTC.OWNER = UO.OWNER))            LEFT OUTER JOIN(SELECT		K.CONSTRAINT_NAME AS CONSTRAINT_NAME,                K.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,                K.OWNER AS OWNER,                K.R_CONSTRAINT_NAME AS R_CONSTRAINT_NAME,                K.TABLE_NAME AS TABLE_NAME,                KC.COLUMN_NAME AS COLUMN_NAME	FROM		ALL_CONSTRAINTS K INNER JOIN 		ALL_CONS_COLUMNS KC ON(                    K.OWNER = KC.OWNER			AND K.CONSTRAINT_NAME = KC.CONSTRAINT_NAME                ) 	WHERE K.CONSTRAINT_TYPE IN('P', 'R')	AND K.OWNER IN('public')) Q1 ON(                    Q1.COLUMN_NAME = UTC.COLUMN_NAME		AND Q1.TABLE_NAME = UO.OBJECT_NAME		AND Q1.OWNER = UO.OWNER)            LEFT OUTER JOIN(SELECT a.table_name AS TABLE_NAME                , a.column_name AS COLUMN_NAME                , a.constraint_name AS constraint_name                , c.constraint_type AS constraint_type                , c_pk.constraint_type AS r_constraint_type                , c.owner AS Owner                , c.r_owner AS r_owner                , c_pk.table_name as r_table_name                , c_pk.constraint_name as r_pk                , cc_pk.column_name as r_column_name		  FROM all_cons_columns a		  JOIN all_constraints  c ON(a.owner = c.owner  AND a.constraint_name = c.constraint_name)		  JOIN all_constraints  c_pk ON(c.r_owner = c_pk.owner  AND c.r_constraint_name = c_pk.constraint_name)		  JOIN all_cons_columns cc_pk ON(cc_pk.constraint_name = c_pk.constraint_name AND cc_pk.owner = c_pk.owner)		  WHERE C.Owner IN('public')            ) Q2 ON(Q1.OWNER = Q2.OWNER AND Q1.CONSTRAINT_NAME = Q2.CONSTRAINT_NAME)            Where UO.OBJECT_TYPE IN('TABLE', 'VIEW')            AND UO.OWNER IN('public')            AND UTC.TABLE_NAME IN('tableName')            ORDER BY            UO.OWNER,                UO.OBJECT_NAME",
    );

    expect(oracledb.close).toBeCalledTimes(1);
    expect(oracledb.close).toBeCalledWith();

    expect(modelObjectProvider).toBeCalledTimes(2);
    expect(modelObjectProvider).toHaveBeenCalledWith({
      clueModelId: 'modelId',
      dataSourceConnectionId: 'connId',
      id: 'uuidv4',
      modelObjectItems: [
        {
          columnName: 'customer_ID',
          constraintType: 'P',
          dataLength: 20,
          dataTypeInDataSource: 'VARCHAR2',
          decimalPoints: 22,
          defaultAggregation: 'Count',
          foreignTableColumnName: 'FK_OWNER_COLUMN',
          foreignTableName: 'FK_TABLE',
          foreignTableSchema: 'FK_OWNER',
          isForeignKey: false,
          isPrimaryKey: true,
          modelObjectItemId: 'uuidv4',
          nameInDatasource: 'dvd_rentals.customer_table.customer_ID',
          precisionInDataSource: 21,
          prettyName: 'customer ID',
          sourceSchema: 'SOURCE_OWNER',
          sourceTable: 'customer_table',
          usage: 'Dimension',
          usageType: 'Text',
        },
      ],
      name: 'customer table',
      nameInDatasource: 'dvd_rentals.customer_table',
      schemata: 'dvd_rentals',
      source: 'Database',
      tenantId: 'tenantId',
      type: 'column_table',
      userId: 'userId',
    });
    expect(modelObjectProvider).toHaveBeenCalledWith({
      clueModelId: 'modelId',
      dataSourceConnectionId: 'connId',
      id: 'uuidv4',
      modelObjectItems: [
        {
          columnName: 'sales_name',
          constraintType: 'R',
          dataLength: 20,
          dataTypeInDataSource: 'VARCHAR2',
          decimalPoints: 22,
          defaultAggregation: 'Count',
          foreignTableColumnName: 'FK_OWNER_COLUMN',
          foreignTableName: 'FK_TABLE',
          foreignTableSchema: 'FK_OWNER',
          isForeignKey: true,
          isPrimaryKey: false,
          modelObjectItemId: 'uuidv4',
          nameInDatasource: 'dvd_rentals.Sales_table.sales_name',
          precisionInDataSource: 21,
          prettyName: 'sales name',
          sourceSchema: 'SOURCE_OWNER',
          sourceTable: 'Sales_table',
          usage: 'Dimension',
          usageType: 'Text',
        },
      ],
      name: 'Sales table',
      nameInDatasource: 'dvd_rentals.Sales_table',
      schemata: 'dvd_rentals',
      source: 'Database',
      tenantId: 'tenantId',
      type: 'column_table',
      userId: 'userId',
    });
  });
});
