import { AbstractMetadataCoordinator } from './metadata-coordinator.base';
var mysql = require('mysql2/promise');



export class MariadbMetadataCoordinator extends AbstractMetadataCoordinator {


        protected async getSchemaInternal(): Promise<any> {
        return this.executeMetadataSQLStatement('SELECT schema_name FROM information_schema.schemata');
    }


    protected async getSchemaObjectsInternal(schemaName: string): Promise<any> {
        return this.executeMetadataSQLStatement('SELECT table_name as object_name , ' 
        + ' (CASE WHEN table_type = \'BASE TABLE\' THEN \'TABLE\' ELSE table_type END) as Object_type'
        + ' FROM information_schema.tables where table_schema = ?', schemaName);
    }


    async executeMetadataSQLStatement(sql, ...params: string[]): Promise<any> {
        try {
            let connection = await mysql.createConnection({
              host: this.connection.connectionInfo.serverName,
              port: this.connection.connectionInfo.serverPort,
      
              user: this.connection.connectionInfo.username,
              password: this.connection.connectionInfo.password,
              database: this.connection.connectionInfo.serviceName,
              connectTimeout: this.connection.connectionInfo.connectionTimeout,
              //debug: true
            });
      
            
            const [rows, fields] = await connection.execute(
                sql,
                [params],
            );
            await connection.end();
            return { result: 'Success', data: rows };
          } catch (error) {
            throw error;
          } 
    }


}