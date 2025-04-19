import { OracleConnectionTester } from './connection.oracler-tester';
import { PostgresConnectionTester } from './connection.postgres-tester';
import {MySQLConnectionTester} from './connection.mysql-tester';
import {MariaDBConnectionTester} from './connection.mariadb-tester';
import {MSSQLConnectionTester} from './connection.mssql-tester';
import { BaseConnectionTester } from './connection.base-tester';


const classes = { Oracle: OracleConnectionTester, Postgres: PostgresConnectionTester, MySQL: MySQLConnectionTester ,
        MariaDB: MariaDBConnectionTester, MSSQL: MSSQLConnectionTester};

export default function instantiateConnectionTester(connection, service): BaseConnectionTester {
    const className = classes[connection.connectionType];
    if (className) {
        return new className(connection, service);
    } else {
        return null;
    }
}