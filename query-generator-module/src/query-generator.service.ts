import { Injectable, HttpService } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';
import { QueryDefinition } from '../../object-schema/src/schemas/query-definition';
import { ClueModelObjectEntry } from '../../object-schema/src/schemas/catalog.model-object';
import { DatasetObject } from '../../object-schema/src/schemas/catalog.dataset';

@Injectable()
export class QueryGeneratorService {

    constructor(private readonly httpService: HttpService) { }

    async queryGenerator(models: ClueModelObjectEntry[], queryDefinition: QueryDefinition, connections: DataSourceConnectionObject[], datasets: DatasetObject[]): Promise<any> {
        return this.httpService.put('http://' + 'query-generator' + ':' + '8410'
            + '/query-generator/generate-query',
            { queryDefinition, models, connections, datasets }).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }

    async generateGraphByModelId(modelId: string): Promise<any> {

        return this.httpService.put('http://' + 'query-generator' + ':' + '8410'
            + '/query-generator/generate-model-graph',
            { modelId }).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }

    async generateGraphByModelObjectIds(modelObjectIds: string[]): Promise<any> {

        return this.httpService.put('http://' + 'query-generator' + ':' + '8410'
            + '/query-generator/graph-for-model-objects',
            { modelObjectIds }).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }

}