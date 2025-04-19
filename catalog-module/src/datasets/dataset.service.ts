import { Injectable, Inject } from '@nestjs/common';
import uuidv4 = require('uuid/v4');
import { DatasetCDBService } from '../../../datasets-controller-module/src/dataset.service'
import { Model } from 'mongoose';
import { TenantDatasetDatabase, ClueSettings, ClueModel, Dataset,DatasetDataFile,  ClueModelObject } from '../../../database-module/src/database.schemas';
import { DatasetObject } from '../../../object-schema/src/schemas/catalog.dataset';
import { ClueModelEntry } from '../../../object-schema/src/schemas/catalog.model';
import { ClueDFSService } from '../../../clue-dfs-module/src/clue-dfs.service';
import { DatasetDataFileObject, DatasetFileTable } from '../../../object-schema/src/schemas/catalog.dataset-datafile';
import { ClueModelObjectEntry } from '../../../object-schema/src/schemas/catalog.model-object';
import postgresDataTypeMapping = require('../../../metadata-importer/metadata-mapping/postgres.json');



@Injectable()
export class DatasetService {

    constructor(
        private readonly datasetCDBService: DatasetCDBService,
        private readonly clueDFSService: ClueDFSService,
        @Inject('TenantDatasetDatabaseProvider') private readonly tenantDatasetDatabaseProvider: Model<TenantDatasetDatabase>,
        @Inject('ClueSettingsProvider') private readonly clueSettingsProvider: Model<ClueSettings>,
        @Inject('datasetProvider') private readonly datasetProvider: Model<Dataset>,
        @Inject('datasetDataFileProvider') private readonly dataFileProvider: Model<DatasetDataFile>,
        @Inject('modelProvider') private readonly clueModelProvider: Model<ClueModel>,
        @Inject('modelObjectProvider') private readonly modelObjectProvider: Model<ClueModelObject>
    ) {

    }
    async createDataset(reqBody: any, userId: any, tenantId: any): Promise<any> {
        const newDataSet = new this.datasetProvider(reqBody);
        newDataSet.id = uuidv4();
        newDataSet.userId = userId;
        newDataSet.tenantId = tenantId;
        newDataSet.lastAccess = new Date().getTime();
        newDataSet.creationDate = new Date().getTime();
        return newDataSet.save();
    }


    async findDatasetById(theId: any, includeDatafiles: boolean): Promise<any> {
        if (includeDatafiles) {
            return this.internalFindDatasetById(theId);
        } else {
            return this.internalFindDatasetWithFilesById(theId);
        }
    }

    async internalFindDatasetById(theId: any): Promise<any> {
        return this.datasetProvider.findOneAndUpdate({ id: theId }, { lastAccess: new Date().getTime() }).exec();
    }

    async internalFindDatasetWithFilesById(theId: any): Promise<any> {
        let emptyDataFiles = [];
        return this.datasetProvider.findOneAndUpdate({ id: theId }, { lastAccess: new Date().getTime() }).exec().then(
            (theDataset) => {
                return this.dataFileProvider.find({ datasetId: theId }).exec().then(
                    (theDataFiles) => {
                        return { theDataset, theDataFiles };
                    })
            }
        );
    }


    async deleteDatasetById(theId: any): Promise<any> {
        return this.datasetProvider.findOne({ id: theId }).exec().then(
            (theDataset) => {
                return this.dataFileProvider.deleteMany({ datasetId: theDataset.id }).exec().then(
                    () => {
                        return this.datasetProvider.deleteOne({ id: theId }).exec();
                    }
                )
            }
        );
    }

    async deleteDatasets(userId: any): Promise<any> {
        return this.datasetProvider.deleteMany({ userId }).exec();
    }

    async updateDataset(theId: any, body: any): Promise<any> {
        body.lastAccess = new Date().getTime();
        return this.datasetProvider.findOneAndUpdate({ id: theId }, body, { new: true }).exec();
    }
    async findDatasetByUserId(id: any): Promise<any> {
        return this.datasetProvider.find({ userId: id }).exec();
    }

    async findDatasetByTenantId(id: any): Promise<any> {
        return this.datasetProvider.find({ tenantId: id }).exec();
    }
    async searchDataset(searchText: any, tenantId: any): Promise<any> {
        return this.datasetProvider.find({ $text: { $search: searchText }, tenantId }).exec();
    }

    async getRecentDatasets(count: number, tenantId: any): Promise<any> {
        return this.datasetProvider.find({ tenantId }).sort({
            lastAccess: -1,
        }).limit(count).exec();
    }


    async createTenantDataset(datasetName: string, datasetDescription: string, tenantId: string, userId: string): Promise<any> {
        return this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec().then(
            (clueSettings) => {
                return this.tenantDatasetDatabaseProvider.findOne({ tenantId }).exec().then(
                    (tenantDatasetDatabaseObj) => {
                        if (!tenantDatasetDatabaseObj) {
                            return this.datasetCDBService.createTenantDatabase(clueSettings, tenantId, userId).then(
                                (cdbServiceResult) => {
                                    if (cdbServiceResult.status === 0) {
                                        return this.createDatasetAndModel(datasetName, datasetDescription, tenantId, userId);
                                    } else {
                                        throw new Error(cdbServiceResult.data);
                                    }
                                }
                            )
                        } else {
                            return this.createDatasetAndModel(datasetName, datasetDescription, tenantId, userId);
                        }
                    }
                )
            })
    }

    async createDatasetAndModel(datasetName: string, datasetDescription: string, tenantId: string, userId: string): Promise<any> {
        const datasetId = uuidv4();
        const clueModelObj: ClueModelEntry = new ClueModelEntry();
        clueModelObj.id = uuidv4();
        clueModelObj.name = 'Model for dataset ' + datasetName;
        clueModelObj.userId = userId;
        clueModelObj.tenantId = tenantId;
        clueModelObj.lastAccess = new Date().getTime();
        clueModelObj.modelType = 'private';
        clueModelObj.datasources = [{ datasourceType: 'Dataset', datasourceId: datasetId }];
        const createdModel = new this.clueModelProvider(clueModelObj);
        return createdModel.save().then(
            (theResult) => {
                const datasetObj: DatasetObject = new DatasetObject();
                datasetObj.id = datasetId;
                datasetObj.userId = userId;
                datasetObj.tenantId = tenantId;
                datasetObj.datasetName = datasetName;
                datasetObj.datasetDescription = datasetDescription;
                datasetObj.skeletonModelId = createdModel.id;
                datasetObj.lastAccess = new Date().getTime();
                datasetObj.creationDate = new Date().getTime();
                const createdDataset = new this.datasetProvider(datasetObj);
                return createdDataset.save();
            }
        );
    }

    async assignNewFileId(fileName: string, datasetId: string , fileSize : number, fileType: string): Promise<any> {
        return this.clueDFSService.assignFid().then(
            (theFileFid) => {
                if (theFileFid) {
                    let prettyName = fileName;
                    if (fileName.indexOf('.') > -1) {
                        prettyName = prettyName.substr(0, prettyName.indexOf('.'));
                    }
                    prettyName = prettyName.replace(/-/g, '_');
                    prettyName = prettyName.replace(/\s/g, '_');


                    const datafileObj: DatasetDataFileObject = new DatasetDataFileObject();
                    datafileObj.id = uuidv4();
                    datafileObj.datasetId = datasetId;
                    datafileObj.fileName = fileName;
                    datafileObj.fileType = fileType;
                    datafileObj.fid = theFileFid.fid.substring(theFileFid.fid.indexOf(',') + 1, theFileFid.fid.length);
                    datafileObj.volumeId = theFileFid.fid.substring(0, theFileFid.fid.indexOf(','));
                    datafileObj.dfsUrl = theFileFid.url;
                    datafileObj.dfsPublicUrl = theFileFid.publicUrl;
                    datafileObj.fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
                    datafileObj.fileSize = fileSize;
                    datafileObj.creationDate = new Date().getTime();

                    if (!datafileObj.tables) { datafileObj.tables = [] };
                    if (fileType == 'CSV') {
                        let table = new DatasetFileTable();  
                        // multiple of these will be created for excel. Excel analysis should generate them.
                        table.id = uuidv4();
                        table.prettyName = prettyName;
                        table.dfsUrl = theFileFid.url;
                        table.dfsPublicUrl = theFileFid.publicUrl;
                        table.fileName = fileName;
                        table.fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
                        table.fid = theFileFid.fid.substring(theFileFid.fid.indexOf(',') + 1, theFileFid.fid.length);
                        table.volumeId = theFileFid.fid.substring(0, theFileFid.fid.indexOf(','));
                        table.dfsUrl = theFileFid.url;
                        table.tableColumns = [];
                        table.fileSize = fileSize;
                        table.creationDate = new Date().getTime();
                        datafileObj.tables.push(table);
                    }
                    
                    const createdDatafileObj = new this.dataFileProvider(datafileObj);
                    return createdDatafileObj.save();
                }
            }
        );
    }

    async deleteDatafile(fileId: string, tenantId: string): Promise<any> {
        const clueSettings = await this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec();
        const tenantDatasetDatabase = await this.tenantDatasetDatabaseProvider.findOne({ tenantId }).exec();
        const theDatafile = await this.dataFileProvider.findOne({ id: fileId }).exec();
        return this.deleteDatafileInternal(clueSettings, tenantDatasetDatabase, theDatafile);

    }
    async deleteDatafileInternal(clueSettings: ClueSettings, tenantDatasetDatabase: TenantDatasetDatabase, theDatafile: DatasetDataFileObject): Promise<any> {
        let requests = [];
        for (let index = 0; index < theDatafile.tables.length; index++) {
            let fid = theDatafile.tables[index].volumeId + ',' + theDatafile.tables[index].fid;
            const modelObjectId = theDatafile.tables[index].modelObjectId;
            requests.push(
                this.deleteTable(tenantDatasetDatabase, clueSettings, theDatafile, modelObjectId, fid , index)
            );
        }
        return Promise.all(requests).then(() => {
            return this.dataFileProvider.deleteOne({ id: theDatafile.id }).exec();
        });


    }

    private async deleteTable(tenantDatasetDatabase: TenantDatasetDatabase, clueSettings: ClueSettings, theDatafile: DatasetDataFileObject, modelObjectId: string, fid: string , tableIndex): Promise<any> {
        return this.datasetCDBService.dropDataTable(tenantDatasetDatabase, clueSettings, theDatafile ,tableIndex ).then(
            (result) => {
                if (result.status === -1 ) {
                    return result; // error dropping the table, don't continue or we lose file information. 
                } else {
                    return this.modelObjectProvider.deleteOne({ id: modelObjectId }).exec().then(
                        () => {
                            return this.clueDFSService.removeFile(fid);
                        }
                    );
                }
            }
        );
    }


    async deleteDataset(datasetId: string, tenantId: string): Promise<any> {
        const clueSettings = await this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec();
        const tenantDatasetDatabase = await this.tenantDatasetDatabaseProvider.findOne({ tenantId }).exec();
        const theDataset = await this.datasetProvider.findOne({ id: datasetId }).exec();

        const theDatafiles = await this.dataFileProvider.find({ datasetId: theDataset.id }).exec();
        for (const theDataFile of theDatafiles) {
            await this.deleteDatafileInternal(clueSettings, tenantDatasetDatabase, theDataFile);
        }
        return this.datasetCDBService.dropDatabase(tenantDatasetDatabase, clueSettings).then(
            () => {
                return this.datasetProvider.deleteOne({ id: theDataset.id }).exec().then(() => {
                    return this.clueModelProvider.deleteOne({ id: theDataset.skeletonModelId }).exec();
                });
            }

        );
    }

    async getDatabaseSize(tenantId: string): Promise<any> {
        const clueSettings = await this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec();
        const tenantDatasetDatabase = await this.tenantDatasetDatabaseProvider.findOne({ tenantId }).exec();

        return this.datasetCDBService.getDatabaseSize(tenantDatasetDatabase, clueSettings);

    }

    async deleteDatasetInternal(theDataset: Dataset, clueSettings: ClueSettings, tenantDatasetDatabase: TenantDatasetDatabase): Promise<any> {
        const theDatafiles = await this.dataFileProvider.find({ datasetId: theDataset.id }).exec();
        for (const theDataFile of theDatafiles) {
            await this.deleteDatafileInternal(clueSettings, tenantDatasetDatabase, theDataFile);
        }
        return this.datasetProvider.deleteOne({ id: theDataset.id }).exec().then(() => {
            return this.clueModelProvider.deleteOne({ id: theDataset.skeletonModelId }).exec();
        });
    }

    async deleteTenant(tenantId: string): Promise<any> {
        const clueSettings = await this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec();
        const tenantDatasetDatabase = await this.tenantDatasetDatabaseProvider.findOne({ tenantId }).exec();
        if (tenantDatasetDatabase) {
            const theDatasets = await this.datasetProvider.find({ tenantId }).exec();
            for (const theDataset of theDatasets) {
                await this.deleteDatasetInternal(theDataset, clueSettings, tenantDatasetDatabase);
            }
            return this.datasetCDBService.dropDatabase(tenantDatasetDatabase, clueSettings).then(() => {
                return this.tenantDatasetDatabaseProvider.deleteOne({ id: tenantDatasetDatabase.id }).exec();
            });
        } else {
            return "Success";
        }

    }

    async importFile(fileId: string, tenantId: string, userId: string, datafileBody?: any): Promise<any> {
        const clueSettings = await this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec();
        const tenantDatasetDatabase = await this.tenantDatasetDatabaseProvider.findOne({ tenantId }).exec();
        let theDatafile;
        if (datafileBody) {
            theDatafile = await this.dataFileProvider.findOneAndUpdate({ id: fileId }, datafileBody, { new: true }).exec();
        } else {
            theDatafile = await this.dataFileProvider.findOne({ id: fileId }).exec();
        }
        let requests = [];
        for (let index = 0; index < theDatafile.tables.length; index++) {
            requests.push(
                this.importTable(theDatafile, tenantDatasetDatabase, clueSettings, fileId, userId, index)
            )
        }
        return Promise.all(requests).then((results) => {
            let atleastOneSucceed = false;
            let atleastOneFailed = false;
            for (let result of results) {
                if (result.status === 'import-failed') {
                    atleastOneFailed = true;
                }
                if (result.status === 'import-complete') {
                    atleastOneSucceed = true;
                }
            }
            if (atleastOneSucceed && atleastOneFailed) {
                return this.dataFileProvider.findOneAndUpdate({ id: fileId }, {
                    status: 'import-partially-failed', 
                    errorMessage: 'File import partially failed'
                }, { new: true }).exec().then((theUpdatedFile) => {
                    return theUpdatedFile;
                });
            } else if (atleastOneFailed) {
                return this.dataFileProvider.findOneAndUpdate({ id: fileId }, {
                    status: 'import-failed',
                    errorMessage: 'File import failed'
                }, { new: true }).exec().then((theUpdatedFile) => {
                    return theUpdatedFile;
                });
            } else {
                return this.dataFileProvider.findOneAndUpdate({ id: fileId }, {
                    status: 'import-complete'
                }, { new: true }).exec().then((theUpdatedFile) => {
                    return theUpdatedFile;
                });
            }

        });
    }

    private async importTable(theDatafile: any, tenantDatasetDatabase: any, clueSettings: any, fileId: string, userId: string, tableIndex): Promise<any> {
        return this.clueDFSService.renderFileUrl(theDatafile.tables[tableIndex].volumeId, theDatafile.tables[tableIndex].fid, theDatafile.tables[tableIndex].fileExtension, false).then(
            (theFileUrl) => {
                console.log('Orchestrator importing file: ' + theFileUrl);
                return this.datasetCDBService.startFileImporter(tenantDatasetDatabase, theFileUrl, clueSettings, theDatafile, tableIndex).then(
                    (result) => {
                        if (result.status === 0) {
                            let importResult = result.data;
                            //"{\"jobId\":\"543813852945219585\",\"status\":\"succeeded\",\"rows\":\"10\"}"
                            if (importResult.status != 'succeeded') {

                                return this.dataFileProvider.findOneAndUpdate({ id: fileId, 'tables.id': theDatafile.tables[tableIndex].id }, {
                                    '$set': {
                                        'tables.$.status': 'import-failed',
                                        'tables.$.jobId': importResult.jobId,
                                        'tables.$.errorMessage': importResult.data
                                    }
                                }, { new: true }).exec().then((theUpdatedFile) => {
                                    return theUpdatedFile.tables[tableIndex];
                                }
                                );
                            }
                            else {
                                return this.createNewModelObject(fileId, userId, tenantDatasetDatabase, tableIndex).then((theModelObj) => {
                                    return this.dataFileProvider.findOneAndUpdate({ id: fileId, 'tables.id': theDatafile.tables[tableIndex].id }, {
                                        '$set': {
                                            'tables.$.status': 'import-complete',
                                            'tables.$.jobId': importResult.jobId,
                                            'tables.$.numberOfLines': importResult.rows,
                                            'tables.$.modelObjectId': theModelObj.id
                                        }
                                    }, { new: true }).exec().then(
                                        (theUpdatedFile) => {
                                            return theUpdatedFile.tables[tableIndex];
                                        }
                                    );
                                });
                            }

                        } else {
                            return this.dataFileProvider.findOneAndUpdate({ id: fileId, 'tables.id': theDatafile.tables[tableIndex].id }, {
                                '$set': {
                                    'tables.$.status': 'import-failed',
                                    'tables.$.errorMessage': result.data
                                }
                            }, { new: true }).exec().then((theUpdatedFile) => {
                                return theUpdatedFile.tables[tableIndex];
                            }
                            );
                        }
                    }
                );
            }
        );
    }

    async analyzeFile(fileId: string): Promise<any> {
        const theDatafile = await this.dataFileProvider.findOneAndUpdate({ id: fileId }, { analyzerStatus: 'in-progress', dfsFileStatus: 'available' }, { new: true }).exec();
        const theFileUrl = await this.clueDFSService.renderFileUrl(theDatafile.volumeId, theDatafile.fid, theDatafile.fileExtension, false);

        switch (theDatafile.fileType) {
          case 'CSV':
            return this.clueDFSService.readFromFileUrl(theFileUrl, (samples) => {
                return this.datasetCDBService.analyzeSample(samples, theDatafile).then((result) => {
                    if (result.status === 0) {
                        return this.dataFileProvider.findOneAndUpdate({ id: fileId }, { status : 'import-ready' , analyzerStatus: 'complete' }, { new: true }).exec();
                    } else {
                        return this.dataFileProvider.findOneAndUpdate({ id: fileId }, { analyzerStatus: 'failed', errorMessage: result.data }, { new: true }).exec();
                    }
                });
            }, (error) => {
                return this.dataFileProvider.findOneAndUpdate({ id: fileId }, { analyzerStatus: 'failed', errorMessage: JSON.stringify(error) }, { new: true }).exec();
            });
          case 'EXCEL':
                return this.datasetCDBService.analyzeExcel(theDatafile).catch(
                    () => {
                        this.dataFileProvider.findOneAndUpdate({ id: fileId }, { analyzerStatus: 'failed' }, { new: true }).exec();
                    }
                );

          default:
            // TODO Return error;
            break;
        }

    }



    async findDatafileById(theId: any): Promise<any> {
        return this.dataFileProvider.findOne({ id: theId }).exec();
    }

    async findDataFilesByDatasetId(id: any): Promise<any> {
        return this.dataFileProvider.find({ datasetId: id }).exec();
    }
    async deleteDataFileById(theId: any): Promise<any> {
        return this.dataFileProvider.deleteOne({ id: theId }).exec();
    }
    async deleteDatasetDatafiles(datasetId: any): Promise<any> {
        return this.dataFileProvider.deleteMany({ datasetId }).exec();
    }
    async updateDatafile(theId: any, body: any): Promise<any> {
        return this.dataFileProvider.findOneAndUpdate({ id: theId }, body, { new: true }).exec();
    }


    async createNewModelObject(fileId: string, userId: string, tenantDatasetDatabase: TenantDatasetDatabase, tableIndex): Promise<any> {
        console.log("inside create model object");
        let theDatafile: DatasetDataFileObject = await this.dataFileProvider.findOne({ id: fileId }).exec();
        let theDataset: Dataset = await this.datasetProvider.findOne({ id: theDatafile.datasetId }).exec();

        let entry = new ClueModelObjectEntry();
        try {
            entry.id = uuidv4();
            //entry.dataSourceConnectionId = this.connection.id;
            entry.schemata = tenantDatasetDatabase.tenantDatabaseName;
            entry.tenantId = tenantDatasetDatabase.tenantId;
            entry.type = 'TABLE';
            entry.userId = userId;
            entry.source = 'Database';
            entry.modelObjectItems = [];
            entry.name = theDatafile.tables[tableIndex].electedTableName.replace(/_/g, ' ');
            entry.dataSourceConnectionId = theDataset.id;
            entry.datasetDatafileId = theDatafile.id;
            entry.tableId = theDatafile.tables[tableIndex].id;


            entry.nameInDatasource = tenantDatasetDatabase.tenantDatabaseName + '.' + theDatafile.tables[tableIndex].electedTableName;
            entry.clueModelId = theDataset.skeletonModelId;


            for (const dataFileColumn of theDatafile.tables[tableIndex].tableColumns) {
                let modelObjectItemId = uuidv4();

                entry.modelObjectItems.push({
                    modelObjectItemId,
                    nameInDatasource: tenantDatasetDatabase.tenantDatabaseName + '.' + theDatafile.tables[tableIndex].electedTableName + '.' + dataFileColumn.electedHeaderName,
                    prettyName: dataFileColumn.columnPrettyName,
                    columnName: dataFileColumn.electedHeaderName,
                    dataTypeInDataSource: dataFileColumn.electedType,
                    dataLength: 0,
                    precisionInDataSource: 0,
                    decimalPoints: 0,
                    usage: postgresDataTypeMapping[dataFileColumn.electedType.toLowerCase()].usage,
                    usageType: postgresDataTypeMapping[dataFileColumn.electedType.toLowerCase()].usageType,
                    defaultAggregation: postgresDataTypeMapping[dataFileColumn.electedType.toLowerCase()].defaultAggregation,
                    sourceSchema: tenantDatasetDatabase.tenantDatabaseName,
                    sourceTable: theDatafile.tables[tableIndex].electedTableName,
                    foreignTableSchema: '',
                    foreignTableName: '',
                    foreignTableColumnName: '',
                    constraintType: '',
                    isPrimaryKey: false,
                    isForeignKey: false,
                    defaultSort: '',
                    sourceModelObjectId: '',
                    sourceModelObjectItemId: '',
                    defaultFormat: '',
                    references: ''
                });
                dataFileColumn.modelObjectItemId = modelObjectItemId;
            }
        } catch (error) {
            throw error;
        }
        
        const createdModelObject = new this.modelObjectProvider(entry);
        await createdModelObject.save();
        return this.dataFileProvider.update({id: theDatafile.id , 'tables.id': theDatafile.tables[tableIndex].id} ,{
            '$set': {
                'tables.$.tableColumns': theDatafile.tables[tableIndex].tableColumns
            }
        }, { new: true }).exec();
        
    }

}
