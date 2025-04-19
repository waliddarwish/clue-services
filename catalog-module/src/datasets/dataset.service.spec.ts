import { Test } from '@nestjs/testing';
import { DatasetCDBService } from '../../../datasets-controller-module/src/dataset.service';
import { ClueDFSService } from '../../../clue-dfs-module/src/clue-dfs.service';
import { DatasetService } from './dataset.service';


let tenantDatasetDatabaseProvider;
let clueSettingsProvider;
let datasetProvider;
let dataFileProvider;
let clueModelProvider;
let modelObjectProvider;
let datasetCDBServiceMocked = {
    createTenantDatabase: jest.fn(),
    dropDataset: jest.fn(),
    dropDatabase: jest.fn(),
    startFileImporter: jest.fn(),
    analyzeSample: jest.fn(),
    deleteTable : jest.fn(),
    dropDataTable: jest.fn(),
};
let clueDFSServiceMocked = {
    assignFid: jest.fn(),
    removeFile: jest.fn(),
    renderFileUrl: jest.fn(),
    readFromFileUrl: jest.fn()
};
let datasetService;
let datasetCDBService;
let clueDFSService;

describe("Test DatasetService ", () => {

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: DatasetCDBService, useFactory: () => { return datasetCDBServiceMocked } },
                { provide: ClueDFSService, useFactory: () => { return clueDFSServiceMocked } },

            ]
        }).compile();
        tenantDatasetDatabaseProvider = {
            find: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            findOne: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            deleteOne: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            findOneAndUpdate: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            exec: jest.fn(),
        };

        clueSettingsProvider = {
            findOne: jest.fn().mockImplementation(() => (clueSettingsProvider)),
            deleteOne: jest.fn().mockImplementation(() => (clueSettingsProvider)),
            exec: jest.fn()
        };
        datasetProvider = {
            find: jest.fn().mockImplementation(() => (datasetProvider)),
            findOne: jest.fn().mockImplementation(() => (datasetProvider)),
            findOneAndUpdate: jest.fn().mockImplementation(() => (datasetProvider)),
            deleteOne: jest.fn().mockImplementation(() => (datasetProvider)),
            deleteMany: jest.fn().mockImplementation(() => (datasetProvider)),
            sort: jest.fn().mockImplementation(() => (datasetProvider)),
            limit: jest.fn().mockImplementation(() => (datasetProvider)),
            exec: jest.fn()
        };
        dataFileProvider = {
            findOne: jest.fn().mockImplementation(() => (dataFileProvider)),
            findOneAndUpdate: jest.fn().mockImplementation(() => (dataFileProvider)),
            find: jest.fn().mockImplementation(() => (dataFileProvider)),
            deleteMany: jest.fn().mockImplementation(() => (dataFileProvider)),
            deleteOne: jest.fn().mockImplementation(() => (dataFileProvider)),
            exec: jest.fn()
        };
        clueModelProvider = {
            findOne: jest.fn().mockImplementation(() => (clueModelProvider)),
            deleteOne: jest.fn().mockImplementation(() => (clueModelProvider)),
            exec: jest.fn()
        };
        modelObjectProvider = {
            findOne: jest.fn().mockImplementation(() => (clueModelProvider)),
            exec: jest.fn(),
            deleteOne: jest.fn().mockImplementation(() => (modelObjectProvider)),
        };

        datasetCDBService = await module.get<DatasetCDBService>(DatasetCDBService);
        clueDFSService = await module.get<ClueDFSService>(ClueDFSService);
        datasetService = new DatasetService(datasetCDBService, clueDFSService, tenantDatasetDatabaseProvider, clueSettingsProvider,
            datasetProvider, dataFileProvider, clueModelProvider, modelObjectProvider);

    });


    it('test findDatasetById scenario 1', async () => {
        let expectedResult = { name: 'hello kitty' };
        let internalFindDatasetByIdOriginal = DatasetService.prototype.internalFindDatasetById;
        DatasetService.prototype.internalFindDatasetById = jest.fn().mockReturnValueOnce(expectedResult);

        let result = await datasetService.findDatasetById({}, true);
        expect(result).toEqual(expectedResult);

        DatasetService.prototype.internalFindDatasetById = internalFindDatasetByIdOriginal;
    });


    it('test findDatasetById scenario 1', async () => {
        let expectedResult = { name: 'hello kitty' };
        let internalFindDatasetWithFilesByIdOriginal = DatasetService.prototype.internalFindDatasetWithFilesById;
        DatasetService.prototype.internalFindDatasetWithFilesById = jest.fn().mockReturnValueOnce(expectedResult);

        let result = await datasetService.findDatasetById({}, false);
        expect(result).toEqual(expectedResult);

        DatasetService.prototype.internalFindDatasetWithFilesById = internalFindDatasetWithFilesByIdOriginal;
    });

    it('test internalFindDatasetById', async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({ name: 'hello' }));
        let result = await datasetService.internalFindDatasetById('id');
        expect(result).toEqual({ name: 'hello' });
    });

    it('test internalFindDatasetWithFilesById', async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({ car: 'bmw' }));
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({ model: 'M2C' }));
        let result = await datasetService.internalFindDatasetWithFilesById('id');
        expect(result).toEqual({ theDataset: { car: 'bmw' }, theDataFiles: { model: 'M2C' } });
    });

    it('test deleteDatasetById', async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({ name: 'hello', id: 'id' }));
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({ name: 'hello', id: 'id' }));
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({ name: 'last knight' }));

        let result = await datasetService.deleteDatasetById('id');
        expect(result).toEqual({ name: 'last knight' });
    });

    it ('test deleteDatasets' , async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.deleteDatasets('id');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test updateDataset' , async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.updateDataset('id', {});
        expect(result).toEqual({name: 'hello'});
    });


    it ('test findDatasetByUserId' , async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.findDatasetByUserId('id');
        expect(result).toEqual({name: 'hello'});
    });


    it ('test findDatasetByTenantId' , async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.findDatasetByTenantId('id');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test searchDataset' , async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.searchDataset('id', 'tenantId');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test getRecentDatasets' , async () => {
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.getRecentDatasets(4, 'tenantId');
        expect(result).toEqual({name: 'hello'});
    });

    it('test createTenantDataset scenario 1', async() => {
        let createDatasetAndModelOriginal = DatasetService.prototype.createDatasetAndModel;

        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve(null));
        datasetCDBServiceMocked.createTenantDatabase.mockReturnValueOnce(Promise.resolve({status: 0}));
        DatasetService.prototype.createDatasetAndModel = jest.fn().mockReturnValueOnce({speed: '+400'});
        let result = await datasetService.createTenantDataset('datasetname', 'dataset_desc', 'tenantid', 'user id');
        expect(result).toEqual({speed: '+400'});
        DatasetService.prototype.createDatasetAndModel = createDatasetAndModelOriginal;
    });


    it('test createTenantDataset scenario 2', async() => {
        let createDatasetAndModelOriginal = DatasetService.prototype.createDatasetAndModel;
        DatasetService.prototype.createDatasetAndModel = jest.fn().mockReturnValueOnce({speed: '+400'});

        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({object: 'obj'}));
        let result = await datasetService.createTenantDataset('datasetname', 'dataset_desc', 'tenantid', 'user id');
        expect(result).toEqual({speed: '+400'});

        DatasetService.prototype.createDatasetAndModel = createDatasetAndModelOriginal;
    });


    it('test createTenantDataset scenario 3', async() => {
        let createDatasetAndModelOriginal = DatasetService.prototype.createDatasetAndModel;

        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve(null));
        datasetCDBServiceMocked.createTenantDatabase.mockReturnValueOnce(Promise.resolve({status: 10, data: 'error'}));
        DatasetService.prototype.createDatasetAndModel = jest.fn().mockReturnValueOnce({speed: '+400'});
 
        expect(datasetService.createTenantDataset('datasetname', 'dataset_desc', 'tenantid', 'user id')).rejects.toEqual(new Error('error'));
        DatasetService.prototype.createDatasetAndModel = createDatasetAndModelOriginal;
    });

    it ('test deleteDatafile' , async () => {
        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let deleteDatafileInternalOriginal = DatasetService.prototype.deleteDatafileInternal;
        DatasetService.prototype.deleteDatafileInternal = jest.fn().mockReturnValue({color: "red"});

        let result = await datasetService.deleteDatafile('fileid', 'tenantId');
        expect(result).toEqual({color: "red"});

        DatasetService.prototype.deleteDatafileInternal = deleteDatafileInternalOriginal;
    });





    it ('test deleteDatafileInternal' , async () => {
        let theDatafile = {
            volumeId: '77776',
            fid: '66667',
            modelObjectId: '55554',
            tables : [{
                volumeId: '77776',
                fid: '66667',
                modelObjectId: '55554',
            }]
        };
        datasetCDBServiceMocked.deleteTable.mockResolvedValue({});
        datasetCDBServiceMocked.dropDataTable.mockResolvedValue({ status : 0});
        modelObjectProvider.exec.mockReturnValue(Promise.resolve({somevalue: 'something'}));
        dataFileProvider.exec.mockReturnValue(Promise.resolve({someresult : 'something'}));
        clueDFSServiceMocked.removeFile.mockReturnValueOnce(Promise.resolve({}));
        

        let result = await datasetService.deleteDatafileInternal({}, {}, theDatafile);
        expect(result).toEqual({someresult : 'something'});
    });


    it ('test deleteDataset' , async () => {
        let deleteDatafileInternalOriginal = DatasetService.prototype.deleteDatafileInternal;

        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));        
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve([{}]));
        DatasetService.prototype.deleteDatafileInternal = jest.fn().mockReturnValueOnce(Promise.resolve({}));
        datasetCDBServiceMocked.dropDatabase.mockReturnValueOnce(Promise.resolve({status: 0}));
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));  
        clueModelProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello12'}));
        let result = await datasetService.deleteDataset('datasetId', 'tenantId');
        expect(result).toEqual({name: 'hello12'});


        DatasetService.prototype.deleteDatafileInternal = deleteDatafileInternalOriginal;
    });


    it ('test deleteDatasetInternal' , async () => {
        let deleteDatafileInternalOriginal = DatasetService.prototype.deleteDatafileInternal;
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve([{}]));
        DatasetService.prototype.deleteDatafileInternal = jest.fn().mockReturnValueOnce(Promise.resolve({}));
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));        
        clueModelProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello12'}));
        let result = await datasetService.deleteDatasetInternal('datasetId', 'tenantId');
        expect(result).toEqual({name: 'hello12'});
        DatasetService.prototype.deleteDatafileInternal = deleteDatafileInternalOriginal;
    });

    it ('test deleteTenant scenario 1' , async () => {
        let deleteDatasetInternalOriginal = DatasetService.prototype.deleteDatasetInternal;
        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        datasetProvider.exec.mockReturnValueOnce(Promise.resolve([{}]));
        DatasetService.prototype.deleteDatasetInternal = jest.fn().mockReturnValueOnce(Promise.resolve({}));
        datasetCDBServiceMocked.dropDatabase.mockReturnValueOnce(Promise.resolve({status: 0}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello14'}));
        let result = await datasetService.deleteTenant('tenant id');
        expect(result).toEqual({name: 'hello14'});
        DatasetService.prototype.deleteDatasetInternal = deleteDatasetInternalOriginal;

    });

    it ('test deleteTenant scenario 2' , async () => {
        clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve(null));
        let result = await datasetService.deleteTenant('tenant id');
        expect(result).toEqual("Success");

    });

    describe('test importFile', () => {
        let theFileUrl = 'www.clueanalytics.com';
        it ('test importFile scenario - one table success' , async () => {
            let importResult = {
                status: 'succeeded',
                rows: '',
                jobId: ''
            };
            clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            dataFileProvider.exec.mockResolvedValue({ tables: [
                {
                    status : 'import-complete'
                }
            ]});
            datasetService.importTable = jest.fn();
            datasetService.importTable.mockResolvedValue({status : 'import-complete'});
            clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve(theFileUrl));
         
            datasetCDBServiceMocked.startFileImporter.mockReturnValueOnce(Promise.resolve(importResult));
            let createNewModelObjectOriginal = DatasetService.prototype.createNewModelObject;
            DatasetService.prototype.createNewModelObject = jest.fn().mockReturnValueOnce(Promise.resolve({}));
            
            let result = await datasetService.importFile('File Id', 'tenantId', 'userId', {});
            expect(result).toEqual({ tables: [
                {
                    status : 'import-complete'
                }
            ]});


            expect(dataFileProvider.findOneAndUpdate).toBeCalledTimes(2);
            expect(dataFileProvider.findOneAndUpdate).toHaveBeenLastCalledWith({ id: 'File Id' }, {
                status: 'import-complete'
            }, { new: true });
            DatasetService.prototype.createNewModelObject = createNewModelObjectOriginal;
        });

        it ('test importFile scenario two tables success' , async () => {
            let importResult = {
                status: 'succeeded',
                rows: '',
                jobId: ''
            };
           
            clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            dataFileProvider.exec.mockResolvedValue({ tables: [
                {
                    status : 'import-complete'
                },
                {
                    status : 'import-complete'
                }
            ]});
            datasetService.importTable = jest.fn();
            datasetService.importTable.mockResolvedValue({status : 'import-complete'});
            clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve(theFileUrl));
         
            datasetCDBServiceMocked.startFileImporter.mockReturnValueOnce(Promise.resolve(importResult));
            let createNewModelObjectOriginal = DatasetService.prototype.createNewModelObject;
            DatasetService.prototype.createNewModelObject = jest.fn().mockReturnValueOnce(Promise.resolve({}));
            
            let result = await datasetService.importFile('File Id', 'tenantId', 'userId', {});
            expect(result).toEqual({ tables: [
                {
                    status : 'import-complete'
                },
                {
                    status : 'import-complete'
                }
            ]});

            expect(dataFileProvider.findOneAndUpdate).toBeCalledTimes(2);
            expect(dataFileProvider.findOneAndUpdate).toHaveBeenLastCalledWith({ id: 'File Id' }, {
                status: 'import-complete'
            }, { new: true });
            DatasetService.prototype.createNewModelObject = createNewModelObjectOriginal;
        });


        it ('test importFile scenario two tables failure' , async () => {
            let importResult = {
                status: 'failed',
                rows: '',
                jobId: ''
            };
           
            clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            dataFileProvider.exec.mockResolvedValue({ tables: [
                {
                    status : 'import-failed'
                },
                {
                    status : 'import-failed'
                }
            ]});
            datasetService.importTable = jest.fn();
            datasetService.importTable.mockResolvedValue({status : 'import-failed'});
            clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve(theFileUrl));
         
            datasetCDBServiceMocked.startFileImporter.mockReturnValueOnce(Promise.resolve(importResult));
            let createNewModelObjectOriginal = DatasetService.prototype.createNewModelObject;
            DatasetService.prototype.createNewModelObject = jest.fn().mockReturnValueOnce(Promise.resolve({}));
            
            let result = await datasetService.importFile('File Id', 'tenantId', 'userId', {});
            expect(result).toEqual({ 
                tables: [
                {
                    status : 'import-failed'
                },
                {
                    status : 'import-failed'
                }
            ]});

            expect(dataFileProvider.findOneAndUpdate).toBeCalledTimes(2);
            expect(dataFileProvider.findOneAndUpdate).toHaveBeenLastCalledWith({ id: 'File Id' }, {
                status: 'import-failed'
            }, { new: true });
            DatasetService.prototype.createNewModelObject = createNewModelObjectOriginal;
        });


        it ('test importFile scenario two tables partial' , async () => {
            let importResult1 = {
                status: 'failed',
                rows: '',
                jobId: ''
            };

            let importResult2 = {
                status: 'succeeded',
                rows: '',
                jobId: ''
            };
           
            clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            dataFileProvider.exec.mockResolvedValue({ tables: [
                {
                    status : 'import-complete'
                },
                {
                    status : 'import-failed'
                }
            ]});
            datasetService.importTable = jest.fn();
            datasetService.importTable.mockResolvedValueOnce({status : 'import-failed'}).mockResolvedValueOnce({status : 'import-complete'});
            clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve(theFileUrl));
         
            datasetCDBServiceMocked.startFileImporter.mockReturnValueOnce(Promise.resolve(importResult1)).mockReturnValueOnce(Promise.resolve(importResult2));
            let createNewModelObjectOriginal = DatasetService.prototype.createNewModelObject;
            DatasetService.prototype.createNewModelObject = jest.fn().mockReturnValueOnce(Promise.resolve({}));
            
            let result = await datasetService.importFile('File Id', 'tenantId', 'userId', {});
            expect(result).toEqual({ 
                tables: [
                {
                    status : 'import-complete'
                },
                {
                    status : 'import-failed'
                }
            ]});

            expect(dataFileProvider.findOneAndUpdate).toBeCalledTimes(2);
            expect(dataFileProvider.findOneAndUpdate).toHaveBeenLastCalledWith({ id: 'File Id' }, {
                status: 'import-partialy-failed'
            }, { new: true });
            DatasetService.prototype.createNewModelObject = createNewModelObjectOriginal;
        });
        

        // it ('test importFile scenario 2' , async () => {
        //     let importResult = {
        //         status: 'succeeded',
        //         rows: '',
        //         jobId: ''
        //     };
        //     clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        //     tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        //     dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        //     clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve(theFileUrl));
        //     datasetCDBServiceMocked.startFileImporter.mockReturnValueOnce(Promise.resolve(importResult));
        //     let createNewModelObjectOriginal = DatasetService.prototype.createNewModelObject;
        //     DatasetService.prototype.createNewModelObject = jest.fn().mockReturnValueOnce(Promise.resolve({}));
        //     dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello15'}));
        //     let result = await datasetService.importFile('File Id', 'tenantId', 'userId');
        //     expect(result).toEqual({name: 'hello15'});
        //     expect(dataFileProvider.findOneAndUpdate).toBeCalledTimes(1);
        //     expect(dataFileProvider.findOne).toBeCalledTimes(1);
        //     DatasetService.prototype.createNewModelObject = createNewModelObjectOriginal;
        // });

        // it ('test importFile scenario 3' , async () => {
        //     let importResult = {
        //         status: 'failed',
        //         rows: '',
        //         jobId: '',
        //         data: 'testError'
        //     };
        //     clueSettingsProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        //     tenantDatasetDatabaseProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        //     dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        //     clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve(theFileUrl));
        //     datasetCDBServiceMocked.startFileImporter.mockReturnValueOnce(Promise.resolve(importResult));
        //     dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello15'}));
        //     expect(datasetService.importFile('File Id', 'tenantId', 'userId', {})).rejects.toEqual(new Error('testError'));
        // });
    });



    describe('test analyzeFile', () => {

        it ('test analyzeFile scenario 1' , async () => {
            dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            clueDFSServiceMocked.renderFileUrl.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
            clueDFSServiceMocked.readFromFileUrl.mockReturnValueOnce(Promise.resolve({name: 'hello16'}));
            datasetCDBService.analyzeSample.mockReturnValueOnce(Promise.resolve({name: 'hello16'}));
            let result = await datasetService.analyzeFile('fileId');
            expect(result).toEqual({name: 'hello16'});
        });

    });


    it ('test findDatafileById' , async () => {
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.findDatafileById('tenantId');
        expect(result).toEqual({name: 'hello'});
    });



    it ('test findDataFilesByDatasetId' , async () => {
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.findDataFilesByDatasetId('tenantId');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test deleteDataFileById' , async () => {
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.deleteDataFileById('tenantId');
        expect(result).toEqual({name: 'hello'});
    });
    it ('test deleteDatasetDatafiles' , async () => {
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.deleteDatasetDatafiles('tenantId');
        expect(result).toEqual({name: 'hello'});
    });

    it ('test updateDatafile' , async () => {
        dataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
        let result = await datasetService.updateDatafile('tenantId');
        expect(result).toEqual({name: 'hello'});
    });




    describe('it test createDataset', () => {
        let newDataSet = {
            id: '',
            userId: '',
            tenantId: '',
            lastAccess: '',
        };
        beforeEach(async () => {
            datasetProvider = jest.fn().mockImplementation(() => {
                return {
                    newDataSet: jest.fn().mockImplementation(() => { return newDataSet }),
                    save: jest.fn().mockReturnValue(Promise.resolve(newDataSet)),
                    findOneAndUpdate: jest.fn().mockReturnValue(datasetProvider),
                    exec: jest.fn().mockReturnValueOnce(Promise.resolve({ name: 'hello' }))
                }
            });
            datasetService = new DatasetService(datasetCDBService, clueDFSService, tenantDatasetDatabaseProvider, clueSettingsProvider,
                datasetProvider, dataFileProvider, clueModelProvider, modelObjectProvider);

        });

        it('test createDataset', async () => {

            datasetCDBService.createTenantDatabase.mockReturnValueOnce(Promise.resolve({status: 0}));
            DatasetService.prototype.createDatasetAndModel = jest.fn().mockReturnValue({id: "test"});
            let result = await datasetService.createDataset('dsname', 'datasetDescription','userid', 'tenantid');
            expect(result).toEqual( { "id": "","lastAccess": "","tenantId": "", "userId": "",
              });
            });
    });


    describe('it test createDatasetAndModel', () => {
        let newDataSet = {
            id: '',
            userId: '',
            tenantId: '',
            lastAccess: '',
        };

        let createdModel = {};
        beforeEach(async () => {
            datasetProvider = jest.fn().mockImplementation(() => {
                return {
                    newDataSet: jest.fn().mockImplementation(() => { return newDataSet }),
                    save: jest.fn().mockReturnValue(Promise.resolve(newDataSet)),
                    findOneAndUpdate: jest.fn().mockReturnValue(datasetProvider),
                    exec: jest.fn().mockReturnValueOnce(Promise.resolve({ name: 'hello' }))
                }
            });

            clueModelProvider = jest.fn().mockImplementation(() => {
                return {
                    newDataSet: jest.fn().mockImplementation(() => { return createdModel }),
                    save: jest.fn().mockReturnValue(Promise.resolve(createdModel)),
                    findOneAndUpdate: jest.fn().mockReturnValue(clueModelProvider),
                    exec: jest.fn().mockReturnValueOnce(Promise.resolve({ name: 'hello2' }))
                }
            });
            datasetService = new DatasetService(datasetCDBService, clueDFSService, tenantDatasetDatabaseProvider, clueSettingsProvider,
                datasetProvider, dataFileProvider, clueModelProvider, modelObjectProvider);

        });

        it('test createDatasetAndModel', async () => {

            let result = await datasetService.createDatasetAndModel('dsname', 'datasetDescription','tenantid', 'userid');
            expect(result).toEqual( { "id": "test"});
            });
    });


    describe('it test assignNewFileId', () => {
        let theFileFid = {
            fid: '123456,7888',
            url: 'www.clueanalytics.com',
            publicUrl: 'www.clueanalytics.public',
        };
        beforeEach(async () => {
            dataFileProvider = jest.fn().mockImplementation(() => {
                return {
                    newDataSet: jest.fn().mockImplementation(() => { return theFileFid }),
                    save: jest.fn().mockReturnValue(Promise.resolve(theFileFid)),
                    findOneAndUpdate: jest.fn().mockReturnValue(dataFileProvider),
                    exec: jest.fn().mockReturnValueOnce(Promise.resolve({ name: 'hello' }))
                }
            });
            datasetService = new DatasetService(datasetCDBService, clueDFSService, tenantDatasetDatabaseProvider, clueSettingsProvider,
                datasetProvider, dataFileProvider, clueModelProvider, modelObjectProvider);

        });

        it('test assignNewFileId', async () => {
            clueDFSServiceMocked.assignFid.mockReturnValue(Promise.resolve(theFileFid));

            let result = await datasetService.assignNewFileId('filename.csv','daatsetId');
            expect(result).toEqual(       {
                fid: '123456,7888',
                url: 'www.clueanalytics.com',
                publicUrl: 'www.clueanalytics.public'
              });
            });
    });




    describe('test createNewModelObject', () => {
        let theFileFid = {
            fid: '123456,7888',
            url: 'www.clueanalytics.com',
            publicUrl: 'www.clueanalytics.public',
        };
        beforeEach(async () => {
            modelObjectProvider = jest.fn().mockImplementation(() => {
                return {
                    newDataSet: jest.fn().mockImplementation(() => { return theFileFid }),
                    save: jest.fn().mockReturnValue(Promise.resolve(theFileFid)),
                    findOneAndUpdate: jest.fn().mockReturnValue(modelObjectProvider),
                    exec: jest.fn().mockReturnValueOnce(Promise.resolve({ name: 'hello' }))
                }
            });
            datasetService = new DatasetService(datasetCDBService, clueDFSService, tenantDatasetDatabaseProvider, clueSettingsProvider,
                datasetProvider, dataFileProvider, clueModelProvider, modelObjectProvider);

        });

        it('test createNewModelObject', async () => {
          //  clueDFSServiceMocked.assignFid.mockReturnValue(Promise.resolve(theFileFid));

    });
    });
});