import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { MetadataImporterService } from '../metadata-importer.service';
import metadataImporterFactory = require('../importers/metadata-importer.factory');




describe('Test Metadata Importer Service', () => {
    let mockAuthenticationService = {};
    let authenticationService;
    let metadataTrackerProvider;
    let modelObjectProvider;
    let metadataImporterService;
    let mockedImporter;
    let connection = {};
    metadataTrackerProvider = {
        updateMany: jest.fn().mockImplementation(()=> {return metadataTrackerProvider}),
        updateOne: jest.fn().mockImplementation(()=> {return metadataTrackerProvider}),
        exec: jest.fn()
    };
    modelObjectProvider = {};

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [            
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
            ]
        }).compile();
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);


        metadataImporterService = new MetadataImporterService(authenticationService, metadataTrackerProvider, modelObjectProvider);

        jest.genMockFromModule('../importers/metadata-importer.factory');
        jest.mock('../importers/metadata-importer.factory');
        mockedImporter = {
            importObject: jest.fn()
        };
    });

    it('test importObjects scenario 1', async () => {
        metadataImporterFactory.instantiateWithProviders = jest.fn().mockReturnValue(mockedImporter);
        mockedImporter.importObject.mockReturnValue(Promise.resolve({name: 'imported'}));

        let result = await metadataImporterService.importObject('tenantId', 'userId', 'trackerId', 'modelId', [], connection);
        expect(result).toEqual({name: 'imported'});

        expect(metadataImporterFactory.instantiateWithProviders).toBeCalledTimes(1);
        expect(metadataImporterFactory.instantiateWithProviders).toBeCalledWith(connection, authenticationService, modelObjectProvider, metadataTrackerProvider);

        expect(mockedImporter.importObject).toBeCalledTimes(1);
        expect(mockedImporter.importObject).toBeCalledWith('modelId', [], 'userId', 'tenantId', 'trackerId');
    
    });

    it('test importObjects scenario 2', async () => {
        metadataImporterFactory.instantiateWithProviders = jest.fn().mockReturnValue(mockedImporter);
        mockedImporter.importObject.mockReturnValue(Promise.reject({name: 'failed'}));
        metadataTrackerProvider.exec.mockReturnValue(Promise.resolve({name: 'metadataTrackerProviderExec'}));

        let result = await metadataImporterService.importObject('tenantId', 'userId', 'trackerId', 'modelId', [], connection);
        expect(result).toEqual({name: 'metadataTrackerProviderExec'});

        expect(metadataImporterFactory.instantiateWithProviders).toBeCalledTimes(1);
        expect(metadataImporterFactory.instantiateWithProviders).toBeCalledWith(connection, authenticationService, modelObjectProvider, metadataTrackerProvider);

        expect(mockedImporter.importObject).toBeCalledTimes(1);
        expect(mockedImporter.importObject).toBeCalledWith('modelId', [], 'userId', 'tenantId', 'trackerId');
        
        expect(metadataTrackerProvider.updateMany).toBeCalledTimes(1);
        expect(metadataTrackerProvider.updateMany).toBeCalledWith({"dataSourceConnectionId": undefined, "trackingId": "trackerId"}, {"errorMessage": {"name": "failed"}, "importTimestamp": expect.anything(), "status": "Error"});
        
        expect(metadataTrackerProvider.exec).toBeCalledTimes(1);
        expect(metadataTrackerProvider.exec).toBeCalledWith();
    });

    it('test importObjects scenario 3', async () => {
        metadataImporterFactory.instantiateWithProviders = jest.fn().mockReturnValue(null);
        metadataTrackerProvider.exec.mockReturnValue(Promise.resolve({name: 'metadataTrackerProviderExec'}));

        let result = await metadataImporterService.importObject('tenantId', 'userId', 'trackerId', 'modelId', [], connection);
        expect(result).toEqual({name: 'metadataTrackerProviderExec'});

        expect(metadataImporterFactory.instantiateWithProviders).toBeCalledTimes(1);
        expect(metadataImporterFactory.instantiateWithProviders).toBeCalledWith(connection, authenticationService, modelObjectProvider, metadataTrackerProvider);

        expect(metadataTrackerProvider.exec).toBeCalledTimes(1);
        expect(metadataTrackerProvider.exec).toBeCalledWith();
        expect(metadataTrackerProvider.updateOne).toBeCalledTimes(1);
        expect(metadataTrackerProvider.updateOne).toBeCalledWith({"id": "trackerId"}, {"errorMessage": "Unsupported connection type undefined", "importTimestamp": expect.anything(), "status": "Error"});
    });

});