import { AbstractMetadataCoordinator } from './metadata-coordinator.base';
const { Client } = require('pg');

export class ProgresMetadataCoordinator extends AbstractMetadataCoordinator {

    protected async getSchemaInternal(): Promise<any> {
        return this.executeMetadataSQLStatement('SELECT schema_name FROM information_schema.schemata');
    }

    protected async getSchemaObjectsInternal(schemaName: string): Promise<any> {
        return this.executeMetadataSQLStatement('SELECT table_name as object_name , ' 
        + ' (CASE WHEN table_type = \'BASE TABLE\' THEN \'TABLE\' ELSE table_type END) as Object_type'
        + ' FROM information_schema.tables where table_schema = $1', schemaName);
    }

    async executeMetadataSQLStatement(sql, ...params: string[]): Promise<any> {
        const client = this.createNewClient(this.connection);
        return client.connect().then(() => {
            return client.query(sql, params).then((res) => {
                return { result: 'Success', data: res.rows };
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
