import { OracleQueryGeneratorImpl } from './oracle-generator';
import { PostgresQueryGeneratorImpl } from './postgres-generator';
import { AbstractQueryGenerator } from './generator.base';
import { GeneratorState } from './generator-state';
import { LogService } from '../../../log-module/src/log.service';
import { CockroachQueryGeneratorImpl } from './cockroach-generator';
import { DatasetObject } from '../../../object-schema/src/schemas/catalog.dataset';


const classes = { Oracle: OracleQueryGeneratorImpl, Postgres: PostgresQueryGeneratorImpl, Cockroach: CockroachQueryGeneratorImpl };



export function instantiateWithConnection(connections: any[], models: any[], queryDefinition: any, logService: LogService, datasets: DatasetObject[]): AbstractQueryGenerator {
    /* FOR DEMO:
        we assume all connections are of the same type. later on, this will be changed to handle
        different connection types and query-stitching servince will be added. 
    */
    let className;
    let connectionName = '';

    if (connections && connections.length > 0) {
        className = classes[connections[0].connectionType];
        connectionName = connections[0].connectionType;
    } else if (datasets && datasets.length > 0) {
        className = classes['Cockroach'];
        connectionName = 'Cockroach';
    }

    console.log("Query-Generator: Factory: connection type: " + connectionName);

    if (className) {
        var generatorstate: GeneratorState = new GeneratorState();
        generatorstate.connections = connections;
        generatorstate.models = models;
        generatorstate.queryDefinition = queryDefinition;
        generatorstate.logService = logService;
        generatorstate.datasets = datasets;
        generatorstate.connectionName = connectionName;

        return new className(generatorstate);
    } else {
        return null;
    }
}