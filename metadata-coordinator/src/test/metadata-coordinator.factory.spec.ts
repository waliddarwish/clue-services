import metadataCoordinationFactory = require('../coordinators/metadata-coordinator.factory');
import { OracleMetadataCoordinator} from '../coordinators/metadata-coordinator.oracle';
import { ProgresMetadataCoordinator } from '../coordinators/metadata-coordinator.postgres';

describe('metadataCoordinationFactory test', () => {

    let connection = {
        connectionType : ''
    };
    let authService = {};
    let importingService = {};
    let connectionTrackerService = {};
    let metadataTrackerProvider = {};

    beforeEach(async () => {
        jest.clearAllMocks();
    })

    it('test instantiate default oracle metadata coordinator', () => {
        connection.connectionType = 'Oracle';
        let coordinator = metadataCoordinationFactory.default(connection, authService);
        expect(coordinator).toEqual(new OracleMetadataCoordinator(connection, authService));
    });

    it('test instantiate default postgres metadata coordinator', () => {
        connection.connectionType = 'Postgres';
        let coordinator = metadataCoordinationFactory.default(connection, authService);
        expect(coordinator).toEqual(new ProgresMetadataCoordinator(connection, authService));
    });

    it('test instantiate default unknown metadata coordinator', () => {
        connection.connectionType = 'whatever db';
        let coordinator = metadataCoordinationFactory.default(connection, authService);
        expect(coordinator).toBeNull();
    });


    it('test instantiateCoordinatorWithImportingService oracle metadata coordinator', () => {
        connection.connectionType = 'Oracle';
        let coordinator = metadataCoordinationFactory.instantiateCoordinatorWithImportingService(connection, authService, importingService, connectionTrackerService, metadataTrackerProvider);
        expect(coordinator).toEqual(new OracleMetadataCoordinator(connection, authService, importingService, connectionTrackerService, metadataTrackerProvider));
    });

    it('test instantiateCoordinatorWithImportingService postgres metadata coordinator', () => {
        connection.connectionType = 'Postgres';
        let coordinator = metadataCoordinationFactory.instantiateCoordinatorWithImportingService(connection, authService, importingService, connectionTrackerService, metadataTrackerProvider);
        expect(coordinator).toEqual(new ProgresMetadataCoordinator(connection, authService, importingService, connectionTrackerService, metadataTrackerProvider));
    });

    it('test instantiateCoordinatorWithImportingService unknown metadata coordinator', () => {
        connection.connectionType = 'whatever db';
        let coordinator = metadataCoordinationFactory.instantiateCoordinatorWithImportingService(connection, authService, importingService, connectionTrackerService, metadataTrackerProvider);
        expect(coordinator).toBeNull();
    });

});