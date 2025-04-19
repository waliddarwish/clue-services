import { QueryDefinition } from "../../../object-schema/src/schemas/query-definition";
import { LogService } from "../../../log-module/src/log.service";
var Graph = require("graph-data-structure");

export class GeneratorState {
    logService: LogService;
    result: number = 0;
    resultMessage: string = "";
    queryDefinition: QueryDefinition;
    models: any[] = [];
    connections: any[] = [];
    datasets: any[] = [];
    fromTables: any[] = [];
    selectClause = "";
    fromClause = "";
    joinClause = "";
    groupByClause = "";
    havingClause = "";
    orderByClause = "";
    limitsClause = "";
    wrapColumnNameInDoubleQuotes = true;

    aggregationClause = "";
    serialezedTableGraph: any;
    serializedColumnGraph: any;
    eligiblePaths: any[] = [];
    query: any;
    tableLevelGraph = Graph();
    columnLevelGraph = Graph();
    tableDFSNodes: any[] = [];
    eligibleJoinPath: any[] = [];
    shortJoinPaths: any[] = [];
    shortestPath: any[] = [];
    possibleHavingItems: any[] = [];
    havingItems: any[] = [];
    groupByItems: any[] = [];
    orderByItems: any[] = [];
    projectionFilterItems: any[] = [];
    connectionName: string = '';
}