import { Injectable, HttpService } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';

@Injectable()
export class ConnectionTestService {
    constructor(private readonly httpService: HttpService) {

    }

    async testConnection(connection: DataSourceConnectionObject): Promise<any> {
        return this.httpService.post('http://' + 'connection-tester' + ':' + '8340'
            + '/connection-test', connection).toPromise().then((result: any) => {
                console.log(result.data);
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });
    }

}
