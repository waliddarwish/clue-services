

import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { AbstractMetadataImporter } from '../importers/metadata-importer.base';


class DummyImporter extends AbstractMetadataImporter{
    protected importObjectInternal(modelId: any, objects: any, userId: any, tenantId: any, trackerId: any): Promise<any> {
        return Promise.resolve({name: 'imported'});
    }
    
}


describe('Test AbstractMetadataImporter', () => {
    let connection = {connectionInfo: {
        username: 'username', 
        serverName: '192.168.0.1',
        serviceName: 'serviceName',
        password: 'password',
        serverPort: 45,
        connectionTimeout: 'connectionTimeout'
    }};

    let decryptionResult = {status: 0, data: 'plain password'};
    let mockAuthenticationService = {
        decryptPassword: jest.fn().mockResolvedValue(decryptionResult)
    };
    let authenticationService;
    let modelObjectProvider;
    let metadataTrackerProvider;
    let metaDataImporter:DummyImporter;

    


    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [            
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
            ]
        }).compile();
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);
        modelObjectProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return {} }),
                save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
            }});
        metadataTrackerProvider = {
            updateMany: jest.fn().mockImplementation(()=> {return metadataTrackerProvider}),
            updateOne: jest.fn().mockImplementation(()=> {return metadataTrackerProvider}),
            exec: jest.fn()
        };
        metaDataImporter = new DummyImporter(connection, authenticationService, modelObjectProvider, metadataTrackerProvider);
    });

    it('test decryptPassword scenario 1', async() => {
        metadataTrackerProvider.exec.mockReturnValue(Promise.resolve({name: 'metadataTrackerProviderExec'}));
        
        let result = await metaDataImporter.importObject('modelId', [], 'userId', 'tenantId','trackerId');
        expect(result).toEqual({name: 'imported'});
        expect(mockAuthenticationService.decryptPassword).toBeCalledTimes(1);
        expect(mockAuthenticationService.decryptPassword).toBeCalledWith("password");

        expect(metadataTrackerProvider.updateOne).toBeCalledTimes(1);
        expect(metadataTrackerProvider.updateOne).toBeCalledWith({"id": "trackerId"}, {"startTimestamp": expect.anything(), "status": "In Progress"});

        expect(metadataTrackerProvider.exec).toBeCalledTimes(1);
        expect(metadataTrackerProvider.exec).toBeCalledWith();

    });

});