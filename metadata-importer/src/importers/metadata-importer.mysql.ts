import { AbstractMetadataImporter } from './metadata-importer.base';
import HashMap = require('hashmap');
import uuidv4 = require('uuid/v4');
import { ClueModelObjectEntry } from '../../../object-schema/src/schemas/catalog.model-object';
import mysqlDataTypeMapping = require('../../metadata-mapping/mysql.json');
var mysql = require('mysql2/promise');





export class MySQLMetadataImporter extends AbstractMetadataImporter {
    protected async importObjectInternal(modelId, objects: any[], userId,
        tenantId, trackerId): Promise<any> {
        

        
        let connection = await mysql.createConnection({
            host: this.connection.connectionInfo.serverName,
            port: this.connection.connectionInfo.serverPort,
    
            user: this.connection.connectionInfo.username,
            password: this.connection.connectionInfo.password,
            database: this.connection.connectionInfo.serviceName,
            connectTimeout: this.connection.connectionInfo.connectionTimeout,
            //debug: true
            });

            const tableCatalog = this.connection.connectionInfo.serviceName;
            let tableNames = '';
            const schema = [];
            for (const object of objects) {
                const nameParts = object.objectName.split('.');
                if (nameParts.length === 2) {
                    tableNames += '\'' + nameParts[1] + '\',';
                    if (schema.indexOf(nameParts[0]) === -1) {
                        schema.push(nameParts[0]);
                    }
                } else {
                    // TODO fail for this specific object
                }
            }
            tableNames = tableNames.substring(0, tableNames.length - 1);
            let schemaNames = ""
            for (const schemta of schema) {
                schemaNames += '\'' + schemta + '\',';
            }
            schemaNames = schemaNames.substring(0, schemaNames.length - 1);

            // First get constraints 
            const constraintsQuery = 'select constraint_schema, constraint_name, table_schema, table_name, column_name, '+
                    'ordinal_position, referenced_table_schema, referenced_table_name, referenced_column_name '+
                    'from information_schema.KEY_COLUMN_USAGE  where table_schema in (' + schemaNames + ') '+
                    'and table_name in (' + tableNames + ') '
                    'and ( constraint_name = \'PRIMARY\' OR referenced_table_name is not null) ';
            
            const [constraintRows, constraintFields] = await connection.execute(
                constraintsQuery,
                [],
                );
            
            const constraintMap = new HashMap();

            for (const constraintRow of constraintRows) {
                constraintMap.set(constraintRow.table_schema + ':' + constraintRow.table_name + ':' + constraintRow.column_name , constraintRow);
            }
            
            // Second get columns

            const columnsQuery = 'select c.table_schema, c.table_name, c.column_name, c.column_default, ' +
                    'c.is_nullable, c.data_type, c.character_maximum_length, ' +
                    'c.numeric_precision, c.numeric_scale, c.column_type, c.column_key, t.table_type ' +
                    'from `INFORMATION_SCHEMA`.`COLUMNS` c, `INFORMATION_SCHEMA`.`tables` t ' +
                    'where c.table_schema in (' + schemaNames + ') and c.table_name in (' + tableNames + ') ' +
                    'and c.table_schema = t.table_schema and  ' +
                    'c.table_name = t.table_name ' ;

            const [columnsRows, columnsFields] = await connection.execute(
                columnsQuery,
                [],
                );

            await connection.end();
            const objectMap = new HashMap();
            let entry = null;
            for (const columnRow of columnsRows) {
                const currentEntry = objectMap.get(columnRow.table_schema + '.' + columnRow.table_name);
                if (!currentEntry) {
                    if (entry) {
                         await this.saveEntry(entry, trackerId, entry.nameInDatasource);
                    } 
                
                    entry = new ClueModelObjectEntry();
                    entry.id = uuidv4();
                    entry.dataSourceConnectionId = this.connection.id;
                    entry.schemata = columnRow.table_schema;
                    entry.tenantId = tenantId;
                    entry.type = (columnRow.table_type === 'BASE TABLE' ? 'TABLE' : 'VIEW');
                    entry.userId = userId;
                    entry.source = 'Database';
                    entry.name = columnRow.table_name.replace(/_/g, ' ');
                    entry.modelObjectItems = [];
                    entry.nameInDatasource = columnRow.table_schema + '.' + columnRow.table_name;
                    entry.clueModelId = modelId;
                    objectMap.set(columnRow.table_schema + '.' + columnRow.table_name, 1);
                }

                let usage = mysqlDataTypeMapping[columnRow.data_type].usage;

                if (columnRow.column_name.toUpperCase().endsWith('ID')) {
                    usage = 'Dimension';
                }

                let theForeignTableSchema = '';
                let theForeignTableName = '';
                let theForeignTableColumnName = '';
                let theConstraintType = '';
                const constraintRow = constraintMap.get(columnRow.table_schema + ':' + columnRow.table_name + ':' + columnRow.column_name);

                if (constraintRow) {
                    if (constraintRow.constraint_name === 'PRIMARY') {
                        theConstraintType = 'PRIMARY KEY';
                    } else if (constraintRow.referenced_table_name && constraintRow.referenced_table_name !== ''){
                        theConstraintType = 'FOREIGN KEY';
                        theForeignTableSchema = constraintRow.referenced_table_schema;
                        theForeignTableName = constraintRow.referenced_table_name;
                        theForeignTableColumnName = constraintRow.referenced_column_name;
                    }
                }

                entry.modelObjectItems.push({
                    modelObjectItemId: uuidv4(),
                    nameInDatasource: columnRow.table_schema + '.' + columnRow.table_name + '.' + columnRow.column_name,
                    prettyName: columnRow.column_name.replace(/_/g, ' '),
                    columnName: columnRow.column_name,
                    dataTypeInDataSource: columnRow.data_type,
                    dataLength: columnRow.character_maximum_length,
                    precisionInDataSource: columnRow.numeric_precision,
                    decimalPoints: columnRow.numeric_scale,
                    usage,
                    usageType: mysqlDataTypeMapping[columnRow.data_type].usageType,
                    defaultAggregation: mysqlDataTypeMapping[columnRow.data_type].defaultAggregation,
                    sourceSchema: columnRow.table_schema,
                    sourceTable: columnRow.table_name,

                    foreignTableSchema: theForeignTableSchema,
                    foreignTableName: theForeignTableName,
                    foreignTableColumnName: theForeignTableColumnName,
                    constraintType: theConstraintType,
                    isPrimaryKey: (theConstraintType === 'PRIMARY KEY' ? true : false),
                    isForeignKey: (theConstraintType === 'FOREIGN KEY' ? true : false),
                });
            }
            if (entry) {
                await this.saveEntry(entry, trackerId,  entry.nameInDatasource); 
            }
        }


    }

