import { Injectable, Inject } from '@nestjs/common';
import { QueryGeneratorService } from '../../../query-generator-module/src/query-generator.service';
import { QueryExecutorService } from '../../../query-executor-module/src/query-executor.service'
import { Model } from 'mongoose';
import { ClueModelObject, ClueModel, DataSourceConnection, Dataset } from '../../../database-module/src/database.schemas';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import uuidValidator = require('uuid-validate');
import orchConfig = require('../../config/config.json');
const fs = require('fs');


@Injectable()
export class QueryService {


    constructor(private readonly queryGeneratorService: QueryGeneratorService,
        private readonly queryExecutorService: QueryExecutorService,
        private readonly globalizationService: GlobalizationService,
        @Inject('modelObjectProvider') private readonly modelObjectProvider: Model<ClueModelObject>,
        @Inject('modelProvider') private readonly modelProvider: Model<ClueModel>,
        @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
        @Inject('datasetProvider') private readonly datasetProvider: Model<Dataset>,
    ) { }

    async handleTestData(connections: any[], models: any[], modelObjs: any[], forDelete?: boolean) {
        try {
            if (forDelete) {
                for (const modelObj of modelObjs) {
                    await this.modelObjectProvider.deleteOne({ "id": modelObj.id });
                }
                for (const model of models) {
                    await this.modelProvider.deleteOne({ id: model.id });
                }

                for (const conn of connections) {
                    await this.dsConnectionModel.deleteOne({ "id": conn.id });
                }


            } else {
                await this.dsConnectionModel.insertMany(connections);
                await this.modelProvider.insertMany(models);
                await this.modelObjectProvider.insertMany(modelObjs);
            }
            return { status: 0, message: "success" };
        } catch (error) {
            return { status: -1, message: "Failed" };
        }
    }


    async handleQuery(queryDefinition: any): Promise<any> {

        const modelObjArray = [];
        const modelIdArray = [];
        const connectionArray = [];
        const connectionIdArray = [];
        const datasetIdArray = [];
        const datasetArray = [];


        const projections = queryDefinition.projections;
        for (const projection of projections) {
            const theModelObj = await this.modelObjectProvider.find({ "modelObjectItems.modelObjectItemId": { $eq: projection.modelObjectItemId } }).exec();
            if (modelIdArray.indexOf(theModelObj[0].id) === -1) {
                modelObjArray.push(theModelObj[0]);
                modelIdArray.push(theModelObj[0].id);
            }

            if (projection.filters) {
                for (let i = 0; i < projection.filters.length; i++) {
                    if (uuidValidator(projection.filters[i].leftSide)) {
                        let theFilterModelObj = await this.modelObjectProvider.find({ "modelObjectItems.modelObjectItemId": { $eq: projection.filters[i].leftSide } }).exec();
                        if (modelIdArray.indexOf(theFilterModelObj[0].id) === -1) {
                            modelObjArray.push(theFilterModelObj[0]);
                            modelIdArray.push(theFilterModelObj[0].id);
                        }
                    }
                }
            }
        }

        for (const theModelObject of modelObjArray) {
            const theGreatModel = await this.modelProvider.findOne({ "id": theModelObject.clueModelId }).exec();
            let connectionType = '';
            for (const connection of theGreatModel.datasources) {
                if (connection.datasourceId == theModelObject.dataSourceConnectionId) {
                    connectionType = connection.datasourceType;
                    break;
                }
            }

            if (connectionType === 'DatabaseConnection') {
                const theConnectionObj = await this.dsConnectionModel.find({ "id": theModelObject.dataSourceConnectionId }).exec();
                if (!theConnectionObj) {
                    throw new Error('Connection with ID [' + theModelObject.dataSourceConnectionId + '] does not exsit');
                }
                if (connectionIdArray.indexOf(theConnectionObj[0].id) === -1) {
                    connectionIdArray.push(theConnectionObj[0].id);
                    connectionArray.push(theConnectionObj[0]);
                }
            } else if (connectionType === 'Dataset') {
                const theDatasetObj = await this.datasetProvider.findOne({ "id": theModelObject.dataSourceConnectionId }).exec();
                if (!theDatasetObj) {
                    throw new Error('Dataset with ID [' + theModelObject.dataSourceConnectionId + '] does not exsit');
                }

                if (datasetIdArray.indexOf(theDatasetObj.id) === -1) {
                    datasetIdArray.push(theDatasetObj.id);
                    datasetArray.push(theDatasetObj);
                }
            } else {
                //TODO return 
            }
        }

        let executorData = '';
        return this.queryGeneratorService.queryGenerator(modelObjArray, queryDefinition, connectionArray, datasetArray).then(
            (generatorOutput) => {
                if (generatorOutput.status === 0) {
                    if (queryDefinition.generateQueryOnly) {
                        return { status: 0, data: generatorOutput.data };
                    } else {
                        return this.queryExecutorService.executeQuery(generatorOutput.data, connectionArray, queryDefinition, modelObjArray, datasetArray).then(
                            (executorOutput) => {
                                if (executorOutput.status === 0) {
                                    executorData = executorOutput.data;
                                    return { status: 0,  data: executorOutput.data };
                                } else {
                                    return this.globalizationService.get('en', '15004').then((theMessage: any): any => {
                                        return { status: 15004, message: theMessage, data: executorOutput };
                                    });
                                }
                            },
                        ).finally(
                            () => {
                                if (orchConfig.orchConfig.saveQueryResults == 1) {
                                    this.saveQueryResults(queryDefinition, generatorOutput.data, executorData, modelObjArray);
                                }
                            }
                        );
                    }
                } else {
                    return this.globalizationService.get('en', '15003').then((theMessage: any): any => {
                        return { status: 15003, message: theMessage, data: generatorOutput.data };
                    });
                }
            }
        )
    }

    async generateGraphByModelObjectIds(clueModelObjectsIds: string[]): Promise<any> {
        return this.queryGeneratorService.generateGraphByModelObjectIds(clueModelObjectsIds).then(
            (result) => {
                if (result.status === 0) {
                    return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                        return { status: 0, message: theMessage,  data: result.data };
                    });
                } else {
                    return this.globalizationService.get('en', '15001').then((theMessage: any): any => {
                        return { status: 15001, message: theMessage, data: result.data };
                    });
                }
            }
        )
    }

    async generateGraphByModelId(clueModelObjectId: string): Promise<any> {
        return this.queryGeneratorService.generateGraphByModelId(clueModelObjectId).then(
            (result) => {
                if (result.status === 0) {
                    return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                        return { status: 0, message: theMessage , data: result.data };
                    });
                } else {
                    return this.globalizationService.get('en', '15002').then((theMessage: any): any => {
                        return { status: 15002, message: theMessage, data: result.data };
                    });
                }
            }
        )
    }

    async saveQueryResults(queryDefination: any, query: any, queryOutput: any, theModels: any) {
        let r = Math.random().toString(36).substring(8);

        fs.writeFile('./queryEngineOutput/' + r + '-query-definition.json', JSON.stringify(queryDefination), (err) => {
            if (err) {
                console.log('Writing query log for testing failed! : ' + JSON.stringify(err))
            }
        });

        fs.writeFile('./queryEngineOutput/' + r + '-query.json', query, (err) => {
            if (err) {
                console.log('Writing query log for testing failed! : ' + JSON.stringify(err))
            }
        });


        fs.writeFile('./queryEngineOutput/' + r + '-query-output.json', JSON.stringify(queryOutput), (err) => {
            if (err) {
                console.log('Writing query log for testing failed! : ' + JSON.stringify(err))
            }
        });

        fs.writeFile('./queryEngineOutput/' + r + '-query-models.json', JSON.stringify(theModels), (err) => {
            if (err) {
                console.log('Writing query log for testing failed! : ' + JSON.stringify(err))
            }
        });
    }

}
