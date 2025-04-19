import { BaseConnectionTester } from './connection.base-tester';
import oracledb = require('oracledb');


export class OracleConnectionTester extends BaseConnectionTester {
    protected async testConnectionInternal(): Promise<any> {
        let oraConnection = null;
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        return oracledb.getConnection({
            user: this.connection.connectionInfo.username,
            password: this.connection.connectionInfo.password,
            connectString: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST='
                + this.connection.connectionInfo.serverName + ')(PORT='
                + this.connection.connectionInfo.serverPort + '))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME='
                + this.connection.connectionInfo.serviceName + ')))',
            callTimeout: this.connection.connectionInfo.connectionTimeout,
        }).then((oracleConnection) => {
            oraConnection = oracleConnection;
            return oraConnection.execute('SELECT * from DUAL').then(() => {
                return { result: 'Success', database: 'Oracle', info: { version: oracleConnection.oracleServerVersionString } };
            });
        }).catch((err) => {
            return { result: 'error', database: 'Oracle', dberror: err };
        }).finally(() => {
            if (oraConnection) {
                try {
                    oraConnection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        });
    }
}