import { Injectable, HttpService } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';
import { ClueModel } from '../../database-module/src/database.schemas';

@Injectable()
export class MetadataCoordinationService {

    constructor(private readonly httpService: HttpService) { }

    async getSchemaObjects(connection: DataSourceConnectionObject, schemaName: any): Promise<any> {

        return this.httpService.post('http://' + 'metadata-coordinator' + ':' + '8380'
            + '/metadata-coordinator/' + schemaName + '/objects', connection).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error: ' + JSON.stringify(error) };
            });

    }

    async getSchemas(connection: DataSourceConnectionObject): Promise<any> {

        return this.httpService.post('http://' + 'metadata-coordinator' + ':' + '8380'
            + '/metadata-coordinator/schemas', connection).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });
    }

    async importModel(model: ClueModel, importSpecs: any, tenantId: string, userId: string, trackingId: string): Promise<any> {

        return this.httpService.post('http://' + 'metadata-coordinator' + ':' + '8380'
            + '/metadata-coordinator/import/' + trackingId + '/' + tenantId + '/' + userId,
            { model, importSpecs }).toPromise().then((result: any) => {
                return result.data;
            }).catch((error) => {
                return { result: 'Internal Error' };
            });
    }

}
