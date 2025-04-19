import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { MetadataImportingService } from '../../../metadata-importing-module/src/metadata-importing.service';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { MetadataCoordinatorService } from '../metadata-coordinator.service';
import metadataCoordinationFactory = require('../coordinators/metadata-coordinator.factory');

describe('test MetadataCoordinatorService', () => {
  let connection = {
    connectionType: '',
  };
  let authenticationServiceMocked = {};
  let authenticationService;
  let metadataImportingService;
  let metadataImportingServiceMocked = {};
  let connectionTrackerService;
  let connectionTrackerServiceMocked = {};
  let dsConnectionModel;
  let metadataTrackerProvider;
  let mockedCoordinatorFactory = {
    getSchemas: jest.fn(),
    importConnectionMetadata: jest.fn()
  };

  let metadataCoordinatorService: MetadataCoordinatorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useFactory: () => {
            return authenticationServiceMocked;
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

    metadataCoordinatorService = new MetadataCoordinatorService(
      authenticationService,
      dsConnectionModel,
      metadataTrackerProvider,
      metadataImportingService,
      connectionTrackerService,
    );
  });

  it('test getSchemas scenario 1', async () => {
    metadataCoordinationFactory.default = jest
      .fn()
      .mockReturnValue(mockedCoordinatorFactory);
    mockedCoordinatorFactory.getSchemas.mockReturnValue(
      Promise.resolve({ name: 'getSchemas' }),
    );

    let result = await metadataCoordinatorService.getSchemas(connection);
    expect(result).toEqual({ name: 'getSchemas' });

    expect(metadataCoordinationFactory.default).toBeCalledTimes(1);
    expect(metadataCoordinationFactory.default).toBeCalledWith(
      connection,
      authenticationService,
    );

    expect(mockedCoordinatorFactory.getSchemas).toBeCalledTimes(1);
    expect(mockedCoordinatorFactory.getSchemas).toBeCalledWith();
  });

  it('test getSchemas scenario 2', async () => {
    connection.connectionType = 'kosa db';
    metadataCoordinationFactory.default = jest.fn().mockReturnValue(null);

    let result = await metadataCoordinatorService.getSchemas(connection);
    expect(result).toEqual({
      result: 'Unsupported Connection type' + connection.connectionType,
    });

    expect(metadataCoordinationFactory.default).toBeCalledTimes(1);
    expect(metadataCoordinationFactory.default).toBeCalledWith(
      connection,
      authenticationService,
    );
  });

  it('test getSchemas scenario 3', async () => {
    metadataCoordinationFactory.default = jest
      .fn()
      .mockReturnValue(mockedCoordinatorFactory);
    mockedCoordinatorFactory.getSchemas.mockReturnValue(
      Promise.reject({ name: 'getSchemas' }),
    );

    let result = await metadataCoordinatorService.getSchemas(connection);
    expect(result).toEqual({
      error: { name: 'getSchemas' },
      result: 'Internal Error',
    });

    expect(metadataCoordinationFactory.default).toBeCalledTimes(1);
    expect(metadataCoordinationFactory.default).toBeCalledWith(
      connection,
      authenticationService,
    );
    expect(mockedCoordinatorFactory.getSchemas).toBeCalledTimes(1);
    expect(mockedCoordinatorFactory.getSchemas).toBeCalledWith();
  });

  describe('test importModel', () => {
    let model = {};
    let importSpecs = [
        {connectionId: '83643734'}
    ];
    let userId = 'userId';
    let tenantId = 'tenantid';
    let theTrackerId = 'tracker id';


    it('test importModel scenario 1', async () => {
        connection.connectionType = '1000 island';
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(connection));
        metadataCoordinationFactory.instantiateCoordinatorWithImportingService = jest.fn().mockReturnValueOnce(mockedCoordinatorFactory);

        let result = await metadataCoordinatorService.importModel(model, importSpecs, userId, tenantId, theTrackerId);
        expect(result).toEqual({status: 'Success - All objects submitted for import'});
        
        expect(dsConnectionModel.findOne).toBeCalledTimes(1);
        expect(dsConnectionModel.findOne).toBeCalledWith({id: importSpecs[0].connectionId , tenantId});
    
        expect(metadataCoordinationFactory.instantiateCoordinatorWithImportingService).toBeCalledTimes(1);
        expect(metadataCoordinationFactory.instantiateCoordinatorWithImportingService).toBeCalledWith(connection, authenticationService, metadataImportingService, connectionTrackerService,metadataTrackerProvider );

        expect(mockedCoordinatorFactory.importConnectionMetadata).toBeCalledTimes(1);
        expect(mockedCoordinatorFactory.importConnectionMetadata).toBeCalledWith(model, importSpecs[0], userId, tenantId, theTrackerId);

    });

    it('test importModel scenario 2', async () => {
        connection.connectionType = '1000 island';
        dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(connection));
        metadataCoordinationFactory.instantiateCoordinatorWithImportingService = jest.fn().mockReturnValueOnce(null);
        

        let result = await metadataCoordinatorService.importModel(model, importSpecs, userId, tenantId, theTrackerId);
        expect(result).toEqual({status: 'Success - All objects submitted for import'});
        
        expect(dsConnectionModel.findOne).toBeCalledTimes(1);
        expect(dsConnectionModel.findOne).toBeCalledWith({id: importSpecs[0].connectionId , tenantId});
    
        expect(metadataCoordinationFactory.instantiateCoordinatorWithImportingService).toBeCalledTimes(1);
        expect(metadataCoordinationFactory.instantiateCoordinatorWithImportingService).toBeCalledWith(connection, authenticationService, metadataImportingService, connectionTrackerService,metadataTrackerProvider );

        expect(metadataTrackerProvider.updateMany).toBeCalledTimes(1);
        expect(metadataTrackerProvider.updateMany).toBeCalledWith({"dataSourceConnectionId": undefined, "trackingId": "tracker id"}, {"errorMessage": "Unsupported connection type 1000 island", "importTimestamp": expect.anything(), "status": "Error"});
        expect(metadataTrackerProvider.exec).toBeCalledTimes(1);
        expect(metadataTrackerProvider.exec).toBeCalledWith();
    });

    /** 
    it('test importModel scenario 3', async () => {
        connection.connectionType = '1000 island';
        dsConnectionModel.findOne.mockReturnValueOnce(Promise.resolve(connection));
        metadataCoordinationFactory.instantiateCoordinatorWithImportingService = jest.fn().mockImplementation(() => {
            throw new Error();
          });

        let result = await metadataCoordinatorService.importModel(model, importSpecs, userId, tenantId, theTrackerId);
        expect(result).toEqual({status: 'Success - All objects submitted for import'});


        //expect(metadataTrackerProvider.updateMany).toBeCalledTimes(1);
        expect(metadataTrackerProvider.updateMany).toBeCalledWith();
    });
*/
  });
});
