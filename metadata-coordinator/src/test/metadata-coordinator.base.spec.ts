import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { MetadataImportingService } from '../../../metadata-importing-module/src/metadata-importing.service';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AbstractMetadataCoordinator } from '../coordinators/metadata-coordinator.base';





describe('AbstractMetadataCoordinator test', () => {

    let connection = {
        id: 8337,
        metadataConcurrency: 5,
        connectionInfo: {
        username: 'username', 
        serverName: '192.168.0.1',
        serviceName: 'serviceName',
        password: 'password',
        serverPort: 45,
        connectionTimeout: 'connectionTimeout'
    }};
      let decryptionResult = { status: 0, data: 'plain password' };
      let authenticationServiceMocked;
      let authenticationService;
      let metadataImportingService;
      let metadataImportingServiceMocked = {
        importObjects: jest.fn(),
        finally: jest.fn()
      };
      let connectionTrackerService;
      let connectionTrackerServiceMocked = {
        acquireMetadataConnections: jest.fn(),
        releaseMetadataConnections: jest.fn()

      };
      let dsConnectionModel;
      let metadataTrackerProvider;
      let mockedCoordinatorFactory = {
        getSchemas: jest.fn(),
        importConnectionMetadata: jest.fn()
      };

      let abstractMetadataCoordinator: AbstractMetadataCoordinator;
    

      beforeEach(async () => {
        jest.clearAllMocks();
        authenticationServiceMocked = {
            decryptPassword: jest.fn().mockResolvedValue(decryptionResult),
          };
        connection.connectionInfo.password = 'password';
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

    
        abstractMetadataCoordinator = new AbstractMetadataCoordinator(connection, authenticationService, metadataImportingService, connectionTrackerService, metadataTrackerProvider);
      });



    it('test getSchemas ', async () => {
        const getSchemaInternalSpy = jest.spyOn(AbstractMetadataCoordinator.prototype as any, 'getSchemaInternal');
        const decryptPasswordSpy = jest.spyOn(AbstractMetadataCoordinator.prototype as any, 'decryptPassword');

        let result = await abstractMetadataCoordinator.getSchemas();
        expect(result).toEqual(undefined);
        expect(getSchemaInternalSpy).toHaveBeenCalled();
        expect(getSchemaInternalSpy).toHaveBeenCalledWith();
        expect(decryptPasswordSpy).toBeCalledTimes(1);
        expect(decryptPasswordSpy).toBeCalledWith();
        expect(authenticationServiceMocked.decryptPassword).toBeCalledTimes(1);
        expect(authenticationServiceMocked.decryptPassword).toBeCalledWith("password");
    });

    it('test getSchemaObjects ', async () => {
        const getSchemaObjectsInternalSpy = jest.spyOn(AbstractMetadataCoordinator.prototype as any, 'getSchemaObjects');
        const decryptPasswordSpy = jest.spyOn(AbstractMetadataCoordinator.prototype as any, 'decryptPassword');

        let schemaName = 'dvd_Rentals';
        let result = await abstractMetadataCoordinator.getSchemaObjects(schemaName);
        expect(result).toEqual(undefined);
        expect(getSchemaObjectsInternalSpy).toHaveBeenCalled();
        expect(getSchemaObjectsInternalSpy).toHaveBeenCalledWith(schemaName);
        expect(decryptPasswordSpy).toBeCalledTimes(1);
        expect(decryptPasswordSpy).toBeCalledWith();
        expect(authenticationServiceMocked.decryptPassword).toBeCalledTimes(1);
        expect(authenticationServiceMocked.decryptPassword).toBeCalledWith("password");
    });

    describe('importConnectionMetadata test', () => {

        let model = {
            id: 28445654
        };
        let importSpec ;
        let userId = '12456';
        let tenantId = '19843';
        let theTrackerId = '3932729';

    
        it('test importConnectionMetadata scenario 1', async() => {

            connection.metadataConcurrency = 2;
            importSpec ={
                objects : [{}]
            };
            metadataImportingServiceMocked.importObjects.mockReturnValue(metadataImportingServiceMocked);
            connectionTrackerServiceMocked.acquireMetadataConnections.mockReturnValueOnce(Promise.resolve(2));
            connectionTrackerServiceMocked.releaseMetadataConnections.mockReturnValue(Promise.resolve());

            let result = await abstractMetadataCoordinator.importConnectionMetadata(model, importSpec, userId, tenantId, theTrackerId);

            expect(connectionTrackerServiceMocked.acquireMetadataConnections).toBeCalled();
            expect(connectionTrackerServiceMocked.acquireMetadataConnections).toBeCalledWith(connection.id, connection.metadataConcurrency);

            expect(metadataImportingServiceMocked.importObjects).toBeCalled();
            expect(metadataImportingServiceMocked.importObjects).toBeCalledWith(tenantId, userId, model.id, theTrackerId, [], connection);

            //expect(connectionTrackerServiceMocked.releaseMetadataConnections).toBeCalled();
            //expect(connectionTrackerServiceMocked.releaseMetadataConnections).toBeCalledWith(connection.id, 1);


        });

        // 1 concurrency and 2 objects. 
        it('test importConnectionMetadata scenario 2', async() => {

            connection.metadataConcurrency = 1;
            importSpec ={
                objects : [{}, {}]
            };
            metadataImportingServiceMocked.importObjects.mockReturnValue(metadataImportingServiceMocked);
            connectionTrackerServiceMocked.acquireMetadataConnections.mockReturnValueOnce(Promise.resolve(2));
            connectionTrackerServiceMocked.releaseMetadataConnections.mockReturnValue(Promise.resolve());

            let result = await abstractMetadataCoordinator.importConnectionMetadata(model, importSpec, userId, tenantId, theTrackerId);

            expect(connectionTrackerServiceMocked.acquireMetadataConnections).toBeCalledTimes(1);
            expect(connectionTrackerServiceMocked.acquireMetadataConnections).toBeCalledWith(connection.id, connection.metadataConcurrency);

            expect(metadataImportingServiceMocked.importObjects).toBeCalledTimes(1);
            expect(metadataImportingServiceMocked.importObjects).toBeCalledWith(tenantId, userId, model.id, theTrackerId, importSpec.objects, connection);

            //expect(connectionTrackerServiceMocked.releaseMetadataConnections).toBeCalled();
            //expect(connectionTrackerServiceMocked.releaseMetadataConnections).toBeCalledWith(connection.id, 1);

        });

        it('test importConnectionMetadata scenario 3', async() => {

            connection.metadataConcurrency = 2;
            importSpec ={
                objects : [{name: 'object1'}, {name: 'object2'},{name: 'object3'},{name: 'object4'},{name: 'object5'}]
            };
            metadataImportingServiceMocked.importObjects.mockReturnValue(metadataImportingServiceMocked);
            connectionTrackerServiceMocked.acquireMetadataConnections.mockReturnValueOnce(Promise.resolve(2));
            connectionTrackerServiceMocked.releaseMetadataConnections.mockReturnValue(Promise.resolve());

            let result = await abstractMetadataCoordinator.importConnectionMetadata(model, importSpec, userId, tenantId, theTrackerId);

            expect(connectionTrackerServiceMocked.acquireMetadataConnections).toBeCalledTimes(1);
            expect(connectionTrackerServiceMocked.acquireMetadataConnections).toBeCalledWith(connection.id, connection.metadataConcurrency);

            expect(metadataImportingServiceMocked.importObjects).toBeCalledTimes(2);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[0][0]).toBe(tenantId);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[0][1]).toBe(userId);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[0][2]).toBe(model.id);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[0][3]).toBe(theTrackerId);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[0][4]).toEqual([{name: 'object1'}, {name: 'object2'}]);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[0][5]).toBe(connection);

            expect(metadataImportingServiceMocked.importObjects.mock.calls[1][0]).toBe(tenantId);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[1][1]).toBe(userId);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[1][2]).toBe(model.id);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[1][3]).toBe(theTrackerId);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[1][4]).toEqual([{"name": "object4"}, {"name": "object5"}]);
            expect(metadataImportingServiceMocked.importObjects.mock.calls[1][5]).toBe(connection);

                        //expect(connectionTrackerServiceMocked.releaseMetadataConnections).toBeCalled();
            //expect(connectionTrackerServiceMocked.releaseMetadataConnections).toBeCalledWith(connection.id, 1);

        });
    });
});