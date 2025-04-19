import { ExecutorState } from './executor-state';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';





export abstract class AbstractQueryExecutor {

    executorState: ExecutorState;
    protected connectionTrackerService: ConnectionTrackerService;
    protected authenticationService: AuthenticationService;
    protected tenantDatasetDatabaseProvider: any;
    protected clueSettingsProvider: any;


    constructor(theExecutorState: ExecutorState,
        theConnectionTrackerService?, theAuthService?,
        theTenantDatasetDatabaseProvider?, theClueSettingsProvider?
    ) {
        this.executorState = theExecutorState;
        this.connectionTrackerService = theConnectionTrackerService;
        this.authenticationService = theAuthService;
        this.tenantDatasetDatabaseProvider = theTenantDatasetDatabaseProvider;
        this.clueSettingsProvider = theClueSettingsProvider
    }

    protected async decryptPassword(): Promise<any> {
        if (this.executorState.connections && this.executorState.connections.length > 0) {
            var connection = this.executorState.connections[0];
            return this.authenticationService.decryptPassword(connection.connectionInfo.password).then((result) => {
                if (result.status === 0) {
                    connection.connectionInfo.password = result.data;
                    return connection;
                } else {
                    throw new Error('Unable to resolve provided password');
                }
            });
        }

    }

    async executeQuery(): Promise<any> {
        return this.decryptPassword().then(async () => {
            // For Demo purpose: We are assuming all connections are of the same type
            let connection = null;
            if (this.executorState.connections && this.executorState.connections.length > 0) {
                connection = this.executorState.connections[0];
            } else if (this.executorState.datasets && this.executorState.datasets.length > 0) {
                connection = this.executorState.datasets[0];
                this.executorState.datasourceType = 'Dataset';
            } else {
                throw new Error("Query-Executor: Datasource not supported");
            }
            this.executorState.acquiredConnectionId = connection.id;
            if (this.executorState.datasourceType === 'Connection') { 
                let acquired = await this.connectionTrackerService.acquireConnections(connection.id , 1);
                if (acquired > 0 ) {
                    return this.executeQueryInternal().finally(
                        async () => {
                            await this.connectionTrackerService.releaseConnections(connection.id, 1 );
                        });
                } else {
                    throw new Error("Query-Executor: Base: Failed to acquire connection(s)");
                }
            } else {
                let acquired = await this.connectionTrackerService.acquireDatasetStoreConnections(connection.tenantId, 1);
                if (acquired > 0 ) {
                    return this.executeQueryInternal().finally(
                        async () => {
                            await this.connectionTrackerService.releaseDatasetStoreConnections(connection.tenantId, 1 );
                        });
                } else {
                    throw new Error("Query-Executor: Base: Failed to acquire dataset store connection(s). Upgrade your plan to obtain more dataset store connections");
                }
            }
        });

    }
    protected abstract async executeQueryInternal(): Promise<any>;
}