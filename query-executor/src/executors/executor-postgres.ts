import { AbstractQueryExecutor } from './executor.base';
const { Client } = require('pg');

export class PostgresQueryExecutorImpl extends AbstractQueryExecutor {



    protected executeQueryInternal(): Promise<any> {
        let connection = this.executorState.connections[0];
        const client = this.createNewClient(connection);
        return client.connect().then(() => {
            return client.query(this.executorState.queryFromGenerator).then((res) => {
                return { status: 0, data: res.rows };
            });
        }).catch((err) => {
            return { status: -1, data: err };
        }).finally(() => {
            client.end();
        });


    }


    public createNewClient(connection: any) {
        return new Client({
            user: connection.connectionInfo.username,
            host: connection.connectionInfo.serverName,
            database: connection.connectionInfo.serviceName,
            password: connection.connectionInfo.password,
            port: connection.connectionInfo.serverPort,
            statement_timeout: connection.connectionInfo.connectionTimeout,
        });
    }
}