import { AbstractQueryExecutor } from './executor.base';
import oracledb = require('oracledb');

export class OracleQueryExecutorImpl extends AbstractQueryExecutor {

    protected executeQueryInternal(): Promise<any> {
        let oraConnection = null;
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        let connection = this.executorState.connections[0];
        return oracledb.getConnection({
            user: connection.connectionInfo.username,
            password: connection.connectionInfo.password,
            connectString: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST='
                + connection.connectionInfo.serverName + ')(PORT='
                + connection.connectionInfo.serverPort + '))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME='
                + connection.connectionInfo.serviceName + ')))',
            callTimeout: connection.connectionInfo.connectionTimeout,
        }).then((oracleConnection) => {
            oraConnection = oracleConnection;
            return oraConnection.execute(this.executorState.queryFromGenerator).then((res) => {
                return { status: 0, data: res.rows };
            });
        }).catch((err) => {
            return { status: -1, data: err };
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
