import { OracleMetadataCoordinator} from './metadata-coordinator.oracle';
import { ProgresMetadataCoordinator } from './metadata-coordinator.postgres';
import { MySQLMetadataCoordinator } from './metadata-coordinator.mysql';
import { MariadbMetadataCoordinator } from './metadata-coordinator.mariadb';

import { AbstractMetadataCoordinator } from './metadata-coordinator.base';


const classes = { Postgres: ProgresMetadataCoordinator, Oracle: OracleMetadataCoordinator, 
MySQL: MySQLMetadataCoordinator, MariaDB: MariadbMetadataCoordinator
};

export default function instantiateCoordinator(connection, authService): AbstractMetadataCoordinator {
    const className = classes[connection.connectionType];
    if (className) {
        return new className(connection, authService);
    } else {
        return null;
    }
}

export function instantiateCoordinatorWithImportingService(connection, authService , importingService,
                                                           connectionTrackerService, metadataTrackerProvider): AbstractMetadataCoordinator {

    const className = classes[connection.connectionType];
    if (className) {
        return new className(connection, authService, importingService, connectionTrackerService, metadataTrackerProvider) ;
    } else {
        return null;
    }
}