import { AbstractMetadataCoordinator } from './metadata-coordinator.base';
const sql = require('mssql');


export class MSSQLMetadataCoordinator extends AbstractMetadataCoordinator {


        protected async getSchemaInternal(): Promise<any> {
          let query = 'select s.name as schema_name, ' +
          's.schema_id, ' +
          'u.name as schema_owner ' +
          'from sys.schemas s ' +
          'inner join sys.sysusers u ' +
          'on u.uid = s.principal_id ' +
          'where u.issqluser = 1 ' +
          'and u.name not in (\'sys\', \'guest\', \'INFORMATION_SCHEMA\') ' ;

          return this.executeMetadataSQLStatement(query);
    }


    protected async getSchemaObjectsInternal(schemaName: string): Promise<any> {
        return this.executeMetadataSQLStatement('SELECT table_name as object_name , ' 
        + ' (CASE WHEN table_type = \'BASE TABLE\' THEN \'TABLE\' ELSE table_type END) as Object_type'
        + ' FROM information_schema.tables where table_schema = \'schemaName\' ');
    }


    async executeMetadataSQLStatement(query): Promise<any> {
      try {
        const connectionInfo = this.connection.connectionInfo;
        const config = {
          user: connectionInfo.username,
          password: connectionInfo.password,
          server: connectionInfo.serverName,
          port: connectionInfo.serverPort,
          database: connectionInfo.serviceName,
          connectionTimeout: connectionInfo.connectionTimeout,
        };
  
        return sql.connect(config).then(pool => {
          return pool.query(query)
        }).then(result => {
          return { result: 'Success', data: result.recordset };
        }).finally(() => {
          sql.close()
        });
  
      } catch (error) {
        throw error;
      }
    }


}