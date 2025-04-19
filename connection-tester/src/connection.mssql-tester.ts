import { BaseConnectionTester } from './connection.base-tester';
const sql = require('mssql');

export class MSSQLConnectionTester extends BaseConnectionTester {
  protected async testConnectionInternal(): Promise<any> {
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
        return pool.query('SELECT @@VERSION as version')
      }).then(result => {
        return {
          result: 'Success',
          database: 'MSSQL',
          info: { version: result.recordset[0].version },
        };
      }).finally(() => {
        sql.close()
      });

    } catch (error) {
      throw error;
    }
  }
}
