import { BaseConnectionTester } from './connection.base-tester';
var mysql = require('mysql2/promise');

export class MySQLConnectionTester extends BaseConnectionTester {
  protected async testConnectionInternal(): Promise<any> {
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
        'SELECT VERSION() as version',
        [],
      );
      return {
        result: 'Success',
        database: 'MySQL',
        info: { version: rows[0].version },
      };
    } catch (error) {
      throw error;
    }
  }

}
