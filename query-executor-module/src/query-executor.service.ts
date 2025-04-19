import { Injectable, HttpService } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';

@Injectable()
export class QueryExecutorService {

    constructor(private readonly httpService: HttpService) { }

    async executeQuery(queryString: string, connections: DataSourceConnectionObject[], queryDefinition: any, models: any[], datasets: any[]): Promise<any> {

        return this.httpService.put('http://' + 'query-executor' + ':' + '8420'
            + '/query-executor/execute-query',
            { queryString, connections, queryDefinition, models, datasets }).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error: ' + JSON.stringify(error) };
            });

    }
}
