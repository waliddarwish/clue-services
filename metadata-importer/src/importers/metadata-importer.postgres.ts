import { AbstractMetadataImporter } from './metadata-importer.base';
const { Client } = require('pg');
import HashMap = require('hashmap');
import uuidv4 = require('uuid/v4');
import { ClueModelObjectEntry } from '../../../object-schema/src/schemas/catalog.model-object';
import postgresDataTypeMapping = require('../../metadata-mapping/postgres.json');

export class PostgresMetadataImporter extends AbstractMetadataImporter {
    protected async importObjectInternal(modelId, objects: any[], userId,
        tenantId, trackerId): Promise<any> {

        const client = this.createNewClient(this.connection);
        return client.connect().then(() => {
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

            const objectMap = new HashMap();
            let newSql = ' SELECT c.table_schema , c.table_name, t.table_type , c.column_name, c.data_type, '
                + ' coalesce(c.character_maximum_length, 0) as character_maximum_length, '
                + ' coalesce(c.numeric_precision, 0) as numeric_precision, '
                + ' coalesce(c.numeric_scale, 0) as numeric_scale, '
                + ' q1.source_schema, q1.source_table, q1.foreign_table_schema, q1.foreign_table_name, q1.foreign_column_name, q1.constraint_type '
                + ' FROM information_schema."columns" As c '
                + ' JOIN information_schema.tables t on '
                + ' c.table_catalog = t.table_catalog '
                + ' AND c.table_schema = t.table_schema '
                + ' AND c.table_name = t.table_name '
                + ' left outer join '
                + ' (SELECT '
                + ' tc.table_schema as source_schema, '
                + ' tc.constraint_name, '
                + ' tc.constraint_type as constraint_type, '
                + ' tc.table_name as source_table, '
                + ' kcu.column_name as source_column, '
                + ' ccu.table_schema AS foreign_table_schema, '
                + ' ccu.table_name AS foreign_table_name, '
                + ' ccu.column_name AS foreign_column_name  '
                + ' FROM  '
                + ' information_schema.table_constraints AS tc  '
                + ' JOIN information_schema.key_column_usage AS kcu '
                + ' ON tc.constraint_name = kcu.constraint_name '
                + ' AND tc.table_schema = kcu.table_schema '
                + ' JOIN information_schema.constraint_column_usage AS ccu '
                + ' ON ccu.constraint_name = tc.constraint_name '
                + ' AND ccu.table_schema = tc.table_schema '
                + ' where tc.table_catalog = \'' + tableCatalog + '\''
                + ' and tc.table_schema in (' + schemaNames + ') '
                + ' ) as q1 on '
                + ' c.table_schema = q1.source_schema '
                + ' and c.table_name = q1.source_table '
                + ' and c.column_name = q1.source_column '
                + ' WHERE c.table_catalog =  \'' + tableCatalog + '\''
                + ' AND t.table_type IN(\'BASE TABLE\' , \'VIEW\') '
                + ' and c.table_name in (' + tableNames + ') '
                + ' and t.table_schema in (' + schemaNames + ') '
                + ' ORDER BY c.table_schema, c.table_name';


            return client.query(newSql).then(async (res) => {
                let entry = null;
                let row = null;
                for (row of res.rows) {
                    const currentEntry = objectMap.get(row.table_schema + '.' + row.table_name);
                    if (!currentEntry) {
                        if (entry) {
                             await this.saveEntry(entry, trackerId, entry.nameInDatasource);
                        } 
                        entry = new ClueModelObjectEntry();
                        entry.id = uuidv4();
                        entry.dataSourceConnectionId = this.connection.id;
                        entry.schemata = row.table_schema;
                        entry.tenantId = tenantId;
                        entry.type = (row.table_type === 'BASE TABLE' ? 'TABLE' : 'VIEW');
                        entry.userId = userId;
                        entry.source = 'Database';
                        entry.name = row.table_name.replace(/_/g, ' ');
                        entry.modelObjectItems = [];
                        entry.nameInDatasource = row.table_schema + '.' + row.table_name;
                        entry.clueModelId = modelId;
                        objectMap.set(row.table_schema + '.' + row.table_name, 1);
                    }

                    let usage = postgresDataTypeMapping[row.data_type].usage;

                    if (row.column_name.toUpperCase().endsWith('ID')) {
                        usage = 'Dimension';
                    }
                    entry.modelObjectItems.push({
                        modelObjectItemId: uuidv4(),
                        nameInDatasource: row.table_schema + '.' + row.table_name + '.' + row.column_name,
                        prettyName: row.column_name.replace(/_/g, ' '),
                        columnName: row.column_name,
                        dataTypeInDataSource: row.data_type,
                        dataLength: row.character_maximum_length,
                        precisionInDataSource: row.numeric_precision,
                        decimalPoints: row.numeric_scale,
                        usage,
                        usageType: postgresDataTypeMapping[row.data_type].usageType,
                        defaultAggregation: postgresDataTypeMapping[row.data_type].defaultAggregation,
                        sourceSchema: row.source_schema,
                        sourceTable: row.source_table,
                        foreignTableSchema: row.foreign_table_schema,
                        foreignTableName: row.foreign_table_name,
                        foreignTableColumnName: row.foreign_column_name,
                        constraintType: row.constraint_type,
                        isPrimaryKey: (row.constraint_type === 'PRIMARY KEY' ? true : false),
                        isForeignKey: (row.constraint_type === 'FOREIGN KEY' ? true : false),
                    });
                }
                if (entry) {
                    await this.saveEntry(entry, trackerId,  entry.nameInDatasource); 
                }

            });
        }).finally(() => {
            client.end();
        });

    }

    public createNewClient(connection: any) {
        return new Client({
            user: this.connection.connectionInfo.username,
            host: this.connection.connectionInfo.serverName,
            database: this.connection.connectionInfo.serviceName,
            password: this.connection.connectionInfo.password,
            port: this.connection.connectionInfo.serverPort,
            statement_timeout: this.connection.connectionInfo.connectionTimeout,
        });
    }
}
