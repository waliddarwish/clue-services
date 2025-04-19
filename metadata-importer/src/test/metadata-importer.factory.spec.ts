import { OracleMetadataImporter } from '../importers/metadata-importer.oracle';
import { PostgresMetadataImporter } from '../importers/metadata-importer.postgres';
import metadataImporterFactory = require('../importers/metadata-importer.factory');


describe('Test metadata importer factory', () => {
    let connection = {
        connectionType: ''
    };
    let service = {};
    let modelItemProvider = {};
    let metadataTrackerProvider = {};

    beforeEach(async () => {

        jest.clearAllMocks();
    
    })

    it('test instantiate default oracle metadata importer', () => {
        connection.connectionType = 'Oracle';
        let importer = metadataImporterFactory.default(connection, service);
        expect(importer).toEqual(new OracleMetadataImporter(connection, service));
    });

    it('test instantiate default postgres metadata importer', () => {
        connection.connectionType = 'Postgres';
        let importer = metadataImporterFactory.default(connection, service);
        expect(importer).toEqual(new PostgresMetadataImporter(connection, service));
    });

    it('test instantiate default unknown metadata importer', () => {
        connection.connectionType = 'weird db';
        let importer = metadataImporterFactory.default(connection, service);
        expect(importer).toEqual(null);
    });


    it('test instantiate oracle metadata importer', () => {
        connection.connectionType = 'Oracle';
        let importer = metadataImporterFactory.instantiateWithProviders(connection, service, modelItemProvider, metadataTrackerProvider);
        expect(importer).toEqual(new OracleMetadataImporter(connection, service, modelItemProvider, metadataTrackerProvider));
    });

    it('test instantiate postgres metadata importer', () => {
        connection.connectionType = 'Postgres';
        let importer = metadataImporterFactory.instantiateWithProviders(connection, service, modelItemProvider, metadataTrackerProvider);
        expect(importer).toEqual(new PostgresMetadataImporter(connection, service, modelItemProvider, metadataTrackerProvider));
    });

    it('test instantiate unknown metadata importer', () => {
        connection.connectionType = 'weird db';
        let importer = metadataImporterFactory.instantiateWithProviders(connection, service, modelItemProvider, metadataTrackerProvider);
        expect(importer).toEqual(null);
    });
});