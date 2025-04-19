import { AbstractMetadataCoordinator } from './metadata-coordinator.base';
import oracledb = require('oracledb');


export class OracleMetadataCoordinator extends AbstractMetadataCoordinator {

    protected async getSchemaObjectsInternal(schemaname: any): Promise<any> {
        return this.runMetadataSQL('Select OBJECT_NAME, OBJECT_TYPE from user_objects where object_type in (\'TABLE\', \'VIEW\')');

    }

    protected async getSchemaInternal(): Promise<any> {
        return this.runMetadataSQL('SELECT USERNAME AS schema_name FROM ALL_USERS');
    }

    protected async runMetadataSQL(sql, ...params: string[]): Promise<any> {

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
            return oraConnection.execute(sql).then((res) => {
                return { result: 'Success', data: res.rows };
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