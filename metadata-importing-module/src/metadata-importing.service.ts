import { Injectable, HttpService } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';

@Injectable()
export class MetadataImportingService {

    constructor(private readonly httpService: HttpService) { }

    async importObjects(tenantId: string, userId: string, modelId: string, trackerId: string, objects: string[],
        connection: DataSourceConnectionObject): Promise<any> {
        return this.httpService.put('http://' + 'metadata-importer' + ':' + '8360'
            + '/metadata-importer/import-objects/' + tenantId + '/' + userId + '/' + modelId + '/' + trackerId,
            { connection, objects }).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }

}
