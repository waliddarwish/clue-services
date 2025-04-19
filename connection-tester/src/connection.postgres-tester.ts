import { BaseConnectionTester } from './connection.base-tester';
const { Client } = require('pg');

export class PostgresConnectionTester extends BaseConnectionTester {
    
    protected async testConnectionInternal(): Promise<any>{
        const client = this.createNewClient(this.connection);
        return client.connect().then(() => {
            return client.query('SELECT VERSION()').then((res) => {
                return { result: 'Success', database: 'Postgres', info: { version: res.rows[0].version } };
            });
        }).catch((err) => {
            return { result: 'error', dberror: err };
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