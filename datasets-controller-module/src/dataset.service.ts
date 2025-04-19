import { Injectable, HttpService } from '@nestjs/common';
import { ClueSettings } from '../../object-schema/src/schemas/catalog.clue-settings';
import { TenantDatasetDatabaseObject } from '../../object-schema/src/schemas/catalog.tenant-dataset-database';
import { DatasetDataFileObject } from '../../object-schema/src/schemas/catalog.dataset-datafile';



@Injectable()
export class DatasetCDBService {
    constructor(private readonly httpService: HttpService) { }

    async createTenantDatabase(clueSetting: ClueSettings, tenantId: string, userId: string): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/create',
            { clueSetting, tenantId, userId }).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data.data;
                } else {
                
                    return { status: -1, message: 'Failed', data: result.data.data }
                }

            }).catch((error) => {
                return { status: -1, data: 'Internal Error'  + JSON.stringify(error)};
            });

    }

    async analyzeSample(sampleLines: [], theDatafile: DatasetDataFileObject): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/analyze-sample',
            { sampleLines, theDatafile }).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data;
                } else {
                    return { status: -1, message: 'Failed', data: result.data.data }
                }
            }).catch((error) => {
                return { status: -1, data: 'Internal Error'  + JSON.stringify(error)};
            });

    }

    async analyzeExcel(theDatafile: DatasetDataFileObject): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/analyze-excel',
            { theDatafile }).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data.data;
                } else {
                    return { status: -1, message: 'Failed', data: result.data.data }
                }
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }

    async startFileImporter(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, dfsFileUrl: string, clueSetting: ClueSettings, theDatafile: DatasetDataFileObject , tableIndex): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/import-file',
            { tenantDatasetDatabaseObject, dfsFileUrl, clueSetting, theDatafile , tableIndex }).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data;
                } else {
                    return { status: -1, message: 'Failed', data: result.data.data }
                }
            }).catch((error) => {
                return { status: -1, data : 'Internal Error: ' + JSON.stringify(error) };
            });

    }


    // Should this be called dropDataFile?
    async dropDataTable(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, clueSetting: ClueSettings, theDatafile: DatasetDataFileObject , tableIndex): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/delete-dataset-table',
            { tenantDatasetDatabaseObject, clueSetting, theDatafile , tableIndex}).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data.data;
                } else {
                    return { status: -1, message: 'Failed', data: result.data.data }
                }
            }).catch((error) => {
                return { result: 'Internal Error' };
            });
    }

    async dropDatabase(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, clueSetting: ClueSettings): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/delete-database',
            { tenantDatasetDatabaseObject, clueSetting }).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data.data;
                } else {
                    return { status: -1, message: 'Failed', data: result.data.data }
                }
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }

    async getDatabaseSize(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, clueSetting: ClueSettings): Promise<any> {
        return this.httpService.put('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/get-database-size',
            { tenantDatasetDatabaseObject, clueSetting }).toPromise().then((result: any) => {
                if (result.data.status === 0) {
                    return result.data.data;
                } else {
                    return { status: -1, message: 'Failed', data: result.data.data }
                }
            }).catch((error) => {
                return { result: 'Internal Error' };
            });

    }
}
