import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Dataset } from '../../../database-module/src/database.schemas';
import uuidv4 = require('uuid/v4');
import { DataSourceConnection } from '../../../database-module/src/database.schemas';
import { ClueModel } from '../../../database-module/src/database.schemas';

@Injectable()
export class DatasourceService {

    constructor(
        @Inject('datasetProvider') private readonly datasetProvider: Model<Dataset>,
        @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
        @Inject('modelProvider') private readonly modelProvider: Model<ClueModel>,
    ) { }

    async getDatasources(searchText, user , databaseConnectionsLimit, datasetLimit): Promise<any> {
        const datasources = [];
        const regexp = new RegExp(searchText, 'gi');

        return this.dsConnectionModel.aggregate(
            [{
                $match : {tenantId: user.tenantId,
                    $expr: {
                        $regexMatch: { input: '$name' , regex: regexp },
                    },
                },
            } , {
                $limit : parseInt(databaseConnectionsLimit , 10),
            } , 
            {
                $project : {
                    id: 1,
                    datasourceType: 'DatabaseConnection',
                    name:  '$name' ,
                    connectionType: 1,
                    serverName : '$connectionInfo.serverName' ,
                    serviceName : '$connectionInfo.serviceName' ,
                    userName:  '$connectionInfo.username'
                }
            }]).exec().then(result1 => {
            if (result1 && result1.length > 0)  {
                datasources.push(...result1);
            }
            return this.datasetProvider.aggregate(
                [{
                    $match : {
                        tenantId: user.tenantId,
                        $expr: {
                            $regexMatch: { input: '$datasetName' , regex: regexp },
                        },
                    },
                } , {
                    $limit : parseInt(datasetLimit , 10),
                } , {
                    $project : {
                        id: 1,
                        datasourceType: 'Dataset',
                        name:  '$datasetName' ,
                        connectionType: 'Dataset',
                        serverName : 'N/A' ,
                        serviceName : 'N/A' ,
                        userName:  'N/A',
                    },
                }],
            ).exec().then(result2 => {
                if (result2 && result2.length > 0) {
                    datasources.push(...result2);
                }
                return datasources;
            });
        });

    }
    
    async getModelSources(searchText, user , datasetLimit, modelLimit): Promise<any> {
        const modelsources = [];
        const regexp = new RegExp(searchText, 'gi');
        return this.modelProvider.aggregate(
            [{
                $match : {tenantId: user.tenantId,
                    modelType: "public",
                    $expr: {
                        $regexMatch: { input: '$name' , regex: regexp },
                    },
                },
            } , {
                $limit : parseInt(modelLimit , 10),
            } , {
                $project : {
                    id: 1,
                    modelType: '$modelType',   
                    name:  '$name' ,
                    userId : '$userId' ,
                    tenantId : '$tenantId' ,
                    modelsourceType: 'Model',
                }
            }]).exec().then(result1 => {
            if (result1 && result1.length > 0)  {
                modelsources.push(...result1);
            }
            return this.datasetProvider.aggregate(
                [{
                    $match : {
                        tenantId: user.tenantId,
                        $expr: {
                            $regexMatch: { input: '$datasetName' , regex: regexp },
                        },
                    },
                } , {
                    $limit : parseInt(datasetLimit , 10),
                } , {
                    $project : {
                        id: "$skeletonModelId",
                        name:  '$datasetName' ,
                        userId : '$userId' ,
                        tenantId : '$tenantId' ,
                        modelsourceType: 'Dataset',
                    },
                }],
            ).exec().then(result2 => {
                if (result2 && result2.length > 0) {
                    modelsources.push(...result2);
                }
                return modelsources;
            });
        });

    }
}
