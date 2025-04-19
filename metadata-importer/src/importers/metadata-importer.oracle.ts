import { AbstractMetadataImporter } from './metadata-importer.base';
import { ClueModelObjectEntry } from '../../../object-schema/src/schemas/catalog.model-object';
import oracledb = require('oracledb');
import uuidv4 = require('uuid/v4');
import HashMap = require('hashmap');
import oracleDataTypeMapping = require('../../metadata-mapping/oralce.json');

export class OracleMetadataImporter extends AbstractMetadataImporter {
/*

SELECT
	UO.OWNER,
	UO.OBJECT_NAME ,
	UO.OBJECT_TYPE ,
	UTC.COLUMN_NAME ,
	UTC.DATA_TYPE ,
	UTC.DATA_LENGTH ,
	NVL(UTC.DATA_PRECISION, 0) AS DATA_PRECISION ,
	NVL(UTC.DATA_SCALE, 0) AS DATA_SCALE,
	Q1.OWNER AS SOURCE_OWNER,
	Q1.CONSTRAINT_NAME AS FK_PK,
	Q1.CONSTRAINT_TYPE AS FK_PK_TYPE,
	Q1.R_CONSTRAINT_NAME AS FK,
	Q2.R_OWNER AS FK_OWNER,
	Q2.R_TABLE_NAME AS FK_TABLE,
	Q2.r_column_name AS FK_COLUMN
FROM
	( ALL_OBJECTS UO INNER JOIN
		ALL_TAB_COLUMNS UTC
		ON (UO.OBJECT_NAME = UTC.TABLE_NAME ) )
	LEFT OUTER JOIN (SELECT
		K.CONSTRAINT_NAME AS CONSTRAINT_NAME ,
		K.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,
		K.OWNER AS OWNER ,
		K.R_CONSTRAINT_NAME AS R_CONSTRAINT_NAME,
		K.TABLE_NAME AS TABLE_NAME,
		KC.COLUMN_NAME AS COLUMN_NAME
	FROM
		ALL_CONSTRAINTS K INNER JOIN
		ALL_CONS_COLUMNS KC ON (
			K.OWNER = KC.OWNER
			AND K.CONSTRAINT_NAME = KC.CONSTRAINT_NAME
		)
	WHERE K.CONSTRAINT_TYPE IN ( 'P' , 'R')
	AND K.OWNER IN ('OTUSER')) Q1 ON (
		Q1.COLUMN_NAME= UTC.COLUMN_NAME
		AND Q1.TABLE_NAME = UO.OBJECT_NAME
		AND Q1.OWNER =  UO.OWNER )
	LEFT OUTER JOIN (SELECT a.table_name AS TABLE_NAME
		     , a.column_name AS COLUMN_NAME
		     , a.constraint_name AS constraint_name
		     , c.constraint_type AS constraint_type
		     , c_pk.constraint_type AS r_constraint_type
		     , c.owner AS Owner
		     , c.r_owner AS r_owner
		     , c_pk.table_name as     r_table_name
		     , c_pk.constraint_name as r_pk
		     , cc_pk.column_name  as   r_column_name
		  FROM all_cons_columns a
		  JOIN all_constraints  c       ON (a.owner                 = c.owner                   AND a.constraint_name   = c.constraint_name     )
		  JOIN all_constraints  c_pk    ON (c.r_owner               = c_pk.owner                AND c.r_constraint_name = c_pk.constraint_name  )
		  JOIN all_cons_columns cc_pk   on (cc_pk.constraint_name   = c_pk.constraint_name      AND cc_pk.owner         = c_pk.owner            )
		) Q2 ON (Q1.OWNER = Q2.OWNER AND Q1.CONSTRAINT_NAME = Q2.CONSTRAINT_NAME )
Where UO.OBJECT_TYPE IN('TABLE', 'VIEW')
	AND UO.OWNER IN ('OTUSER')
	AND UTC.TABLE_NAME IN ('CONTACTS' ,'ORDERS' ,'ORDER_ITEMS' )
ORDER BY
	UO.OWNER,
	UO.OBJECT_NAME ;
*/

    protected async importObjectInternal(modelId, objects: any[], userId,
                                         tenantId, trackerId): Promise<any> {
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
            const objectMap = new HashMap();
            const schema = [];
            let objectNames = '';
            for (const object of objects) {
                const nameParts = object.objectName.split('.');
                if (nameParts.length === 2) {
                    objectNames += '\'' + nameParts[1] + '\',';
                    if (schema.indexOf(nameParts[0]) === -1) {
                        schema.push(nameParts[0]);
                    }
                } else {
                    // TODO fail for this specific object
                }
            }
            objectNames = objectNames.substring(0, objectNames.length - 1);
            let schemaNames = '';
            for (const schemta of schema) {
                schemaNames += '\'' + schemta + '\',';
            }
            schemaNames = schemaNames.substring(0, schemaNames.length - 1);
            let sql =     '            SELECT'
                        + '            UO.OWNER AS OWNER,'
                        + '            UO.OBJECT_NAME AS OBJECT_NAME,'
                        + '            UO.OBJECT_TYPE AS OBJECT_TYPE,'
                        + '            UTC.COLUMN_NAME AS COLUMN_NAME,'
                        + '            UTC.DATA_TYPE AS DATA_TYPE ,'
                        + '            UTC.DATA_LENGTH AS DATA_LENGTH,'
                        + '            NVL(UTC.DATA_PRECISION, 0) AS DATA_PRECISION,'
                        + '            NVL(UTC.DATA_SCALE, 0) AS DATA_SCALE,'
                        + '            Q1.OWNER AS SOURCE_OWNER,'
                        + '            Q1.CONSTRAINT_NAME AS FK_PK,'
                        + '            Q1.CONSTRAINT_TYPE AS FK_PK_TYPE,'
                        + '            Q1.R_CONSTRAINT_NAME AS FK,'
                        + '            Q2.R_OWNER AS FK_OWNER,'
                        + '            Q2.R_TABLE_NAME AS FK_TABLE,'
                        + '            Q2.r_column_name AS FK_COLUMN'
                        + '            FROM'
                        + '                (ALL_OBJECTS UO INNER JOIN '
                        + '		ALL_TAB_COLUMNS UTC '
                + '		ON(UO.OBJECT_NAME = UTC.TABLE_NAME AND UTC.OWNER = UO.OWNER))'
                        + '            LEFT OUTER JOIN(SELECT'
                        + '		K.CONSTRAINT_NAME AS CONSTRAINT_NAME,'
                        + '                K.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,'
                        + '                K.OWNER AS OWNER,'
                        + '                K.R_CONSTRAINT_NAME AS R_CONSTRAINT_NAME,'
                        + '                K.TABLE_NAME AS TABLE_NAME,'
                        + '                KC.COLUMN_NAME AS COLUMN_NAME'
                        + '	FROM'
                        + '		ALL_CONSTRAINTS K INNER JOIN '
                        + '		ALL_CONS_COLUMNS KC ON('
                        + '                    K.OWNER = KC.OWNER'
                        + '			AND K.CONSTRAINT_NAME = KC.CONSTRAINT_NAME'
                        + '                ) '
                        + '	WHERE K.CONSTRAINT_TYPE IN(\'P\', \'R\')'
                        + '	AND K.OWNER IN(' + schemaNames + ')) Q1 ON('
                        + '                    Q1.COLUMN_NAME = UTC.COLUMN_NAME'
                        + '		AND Q1.TABLE_NAME = UO.OBJECT_NAME'
                        + '		AND Q1.OWNER = UO.OWNER)'
                        + '            LEFT OUTER JOIN(SELECT a.table_name AS TABLE_NAME'
                        + '                , a.column_name AS COLUMN_NAME'
                        + '                , a.constraint_name AS constraint_name'
                        + '                , c.constraint_type AS constraint_type'
                        + '                , c_pk.constraint_type AS r_constraint_type'
                        + '                , c.owner AS Owner'
                        + '                , c.r_owner AS r_owner'
                        + '                , c_pk.table_name as r_table_name'
                        + '                , c_pk.constraint_name as r_pk'
                        + '                , cc_pk.column_name as r_column_name'
                        + '		  FROM all_cons_columns a'
                        + '		  JOIN all_constraints  c ON(a.owner = c.owner  AND a.constraint_name = c.constraint_name)'
                        + '		  JOIN all_constraints  c_pk ON(c.r_owner = c_pk.owner  AND c.r_constraint_name = c_pk.constraint_name)'
                        + '		  JOIN all_cons_columns cc_pk ON(cc_pk.constraint_name = c_pk.constraint_name AND cc_pk.owner = c_pk.owner)'
                        + '		  WHERE C.Owner IN(' + schemaNames + ')'
                        + '            ) Q2 ON(Q1.OWNER = Q2.OWNER AND Q1.CONSTRAINT_NAME = Q2.CONSTRAINT_NAME)'
                        + '            Where UO.OBJECT_TYPE IN(\'TABLE\', \'VIEW\')'
                        + '            AND UO.OWNER IN(' + schemaNames + ')'
                        + '            AND UTC.TABLE_NAME IN(' + objectNames + ')'
                        + '            ORDER BY'
                        + '            UO.OWNER,'
                        + '                UO.OBJECT_NAME';

            return oraConnection.execute(sql).then((res) => {
                let entry = null;
                let row = null;
                for (row of res.rows) {
                    const currentEntry = objectMap.get(row.OWNER + '.' + row.OBJECT_NAME);
                    if (!currentEntry) {
                        if (entry) {
                            this.saveEntry(entry, trackerId, entry.nameInDatasource);
                        }
                        entry = new ClueModelObjectEntry();
                        entry.id = uuidv4();
                        entry.dataSourceConnectionId = this.connection.id;
                        entry.schemata = row.OWNER;
                        entry.tenantId = tenantId;
                        entry.type = row.OBJECT_TYPE;
                        entry.userId = userId;
                        entry.source = 'Database';
                        entry.name = row.OBJECT_NAME.replace(/_/g, ' ');
                        entry.modelObjectItems = [];
                        entry.nameInDatasource = row.OWNER + '.' + row.OBJECT_NAME;
                        entry.clueModelId = modelId;
                        objectMap.set(row.OWNER + '.' + row.OBJECT_NAME , 1);
                    }
                        let usage = oracleDataTypeMapping[row.DATA_TYPE] ? oracleDataTypeMapping[row.DATA_TYPE].usage : 'Dimension';

                        if (row.COLUMN_NAME.toUpperCase().endsWith('ID')) {
                            usage = 'Dimension';
                        }
                        entry.modelObjectItems.push({
                        modelObjectItemId: uuidv4(),
                        nameInDatasource: row.OWNER + '.' + row.OBJECT_NAME + '.' + row.COLUMN_NAME,
                        prettyName: row.COLUMN_NAME.replace(/_/g, ' '),
                        dataTypeInDataSource: row.DATA_TYPE,
                        columnName: row.COLUMN_NAME,
                        dataLength: row.DATA_LENGTH,
                        precisionInDataSource: row.DATA_PRECISION,
                        decimalPoints: row.DATA_SCALE,
                        usage,
                        usageType: oracleDataTypeMapping[row.DATA_TYPE] ? oracleDataTypeMapping[row.DATA_TYPE].usageType : 'Text',
                        defaultAggregation: oracleDataTypeMapping[row.DATA_TYPE] ?
                            oracleDataTypeMapping[row.DATA_TYPE].defaultAggregation : 'Count',
                        sourceSchema: row.SOURCE_OWNER,
                        sourceTable: row.OBJECT_NAME,
                        foreignTableSchema: row.FK_OWNER,
                        foreignTableName: row.FK_TABLE,
                        foreignTableColumnName: row.FK_OWNER_COLUMN,
                        constraintType: row.FK_PK_TYPE,
                        isPrimaryKey: (row.FK_PK_TYPE === 'P' ? true : false),
                        isForeignKey: (row.FK_PK_TYPE === 'R' ? true : false),
                    });
                }
                if (entry) {
                    this.saveEntry(entry, trackerId, entry.nameInDatasource);
                }
            });
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
