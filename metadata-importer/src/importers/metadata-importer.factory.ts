import { OracleMetadataImporter } from './metadata-importer.oracle';
import { PostgresMetadataImporter } from './metadata-importer.postgres';
import { MySQLMetadataImporter } from './metadata-importer.mysql';
import { MariaDbMetadataImporter } from './metadata-importer.mariadb';
import { AbstractMetadataImporter } from './metadata-importer.base';


const classes = { Oracle: OracleMetadataImporter, Postgres: PostgresMetadataImporter, MySQL: MySQLMetadataImporter, MariaDB: MariaDbMetadataImporter };

export default function instantiateWithConnection(connection, service): AbstractMetadataImporter {
    const className = classes[connection.connectionType];
    if (className) {
        return new className(connection, service);
    } else {
        return null;
    }
}

export function instantiateWithProviders(connection, service, modelItemProvider, metadataTrackerProvider ): AbstractMetadataImporter {
    const className = classes[connection.connectionType];
    if (className) {
        return new className(connection, service, modelItemProvider, metadataTrackerProvider);
    } else {
        return null;
    }
}