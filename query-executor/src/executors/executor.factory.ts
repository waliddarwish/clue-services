import { OracleQueryExecutorImpl } from './executor-oracle';
import { PostgresQueryExecutorImpl } from './executor-postgres';
import { AbstractQueryExecutor } from './executor.base';
import { QueryDefinition } from '../../../object-schema/src/schemas/query-definition';
import { ClueModelObject } from '../../../database-module/src/database.schemas';
import { DataSourceConnectionObject } from '../../../object-schema/src/schemas/catalog.connection';
import { ExecutorState } from './executor-state';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { DatasetObject } from '../../../object-schema/src/schemas/catalog.dataset';
import { CockroachQueryExecutorImpl } from './executor-cockroach';





const classes = { Oracle: OracleQueryExecutorImpl, Postgres: PostgresQueryExecutorImpl, Cockroach: CockroachQueryExecutorImpl };

export function instantiateExecutor(queryString: any, connections: DataSourceConnectionObject[],
    queryDefinition: QueryDefinition, models: ClueModelObject[], connectionTrackerService: ConnectionTrackerService,
    authService: AuthenticationService, datasets: DatasetObject[],
    tenantDatasetDatabaseProvider: any, clueSettingsProvider: any): AbstractQueryExecutor {
    /* FOR DEMO:
        we assume all connections are of the same type. later on, this will be changed to handle
        different connection types and query-stitching servince will be added. 
    */
    let className;
    let connectionName = '';
    if (connections && connections.length > 0) {
        className = classes[connections[0].connectionType];
        connectionName = connections[0].connectionType;
    } else if (datasets && datasets.length > 0) {
        className = classes['Cockroach'];
        connectionName = 'Cockroach';
    }

    console.log("Query-Executor: Factory: connection type: " + connectionName);

    if (className) {
        var executorState: ExecutorState = new ExecutorState();
        executorState.connections = connections;
        executorState.queryFromGenerator = queryString;
        executorState.models = models;
        executorState.queryDefinition = queryDefinition;
        executorState.datasets = datasets;
        executorState.connectionType = connectionName;

        return new className(executorState, connectionTrackerService, authService,
            tenantDatasetDatabaseProvider, clueSettingsProvider);
    } else {
        return null;
    }
}