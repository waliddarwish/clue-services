import { QueryDefinition } from "../../../object-schema/src/schemas/query-definition";

export class ExecutorState {
    result: number = -1;
    resultMessage: string = '';
    models: any[] = [];
    connections: any[] = [];
    datasets: any[] = [];
    connectionType: string = '';
    queryDefinition: QueryDefinition;
    queryFromGenerator : string = '';
    acquiredConnectionId : string = '';
    datasourceType : string = 'Connection';
}
