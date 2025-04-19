import { BaseConnectionTester } from './connection.base-tester';
const mariadb = require('mariadb');

export class MariaDBConnectionTester extends BaseConnectionTester {
  protected async testConnectionInternal(): Promise<any> {
    const pool = this.createNewPool(this.connection);
    let client = await pool.getConnection();

    return client
      .query('SELECT VERSION() as version')
      .then(res => {
        return {
          result: 'Success',
          database: 'MariaDb',
          info: { version: res[0].version },
        };
      })
      .catch(err => {
        return { result: 'error', dberror: err };
      })
      .finally(() => {
        client.end();
      });
  }

  public createNewPool(connection: any) {
    return mariadb.createPool({
      host: connection.connectionInfo.serverName,
      user: connection.connectionInfo.username,
      password: connection.connectionInfo.password,
      database: connection.connectionInfo.serviceName,
      port: connection.connectionInfo.serverPort,
      connectTimeout: connection.connectionInfo.connectionTimeout,
    });
  }
}
