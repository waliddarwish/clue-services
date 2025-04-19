import { Test } from '@nestjs/testing';
import { HttpService, Post } from '@nestjs/common';
import { DatasetCDBService } from './dataset.service';


const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn(),
    put: jest.fn()
};

describe('Test datasets controller module', () => {
    let httpService;
    let datasetCDBService;
    let theClueSettings = {};
    let theTenantId = '1';
    let theUserId = '2';

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DatasetCDBService,
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        datasetCDBService = await module.get<DatasetCDBService>(DatasetCDBService);
    });

    describe('Test createTenantDatabase', () => {
        it('Will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "dataset data"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.createTenantDatabase(theClueSettings, theTenantId, theUserId)).resolves.toEqual(result.data.data);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/create', { clueSetting: theClueSettings, tenantId: theTenantId, userId: theUserId });

        });

        it('Will be fail to create the dataset', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "dataset data"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.createTenantDatabase(theClueSettings, theTenantId, theUserId)).resolves.toEqual({ status: -1, message: 'Failed', data: result.data.data });
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/create', { clueSetting: theClueSettings, tenantId: theTenantId, userId: theUserId });

        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error' + JSON.stringify(new Error('failed')) };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(datasetCDBService.createTenantDatabase(theClueSettings, theTenantId, theUserId)).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/create', { clueSetting: theClueSettings, tenantId: theTenantId, userId: theUserId });

        });
    });

    describe('Test analyzeSample', () => {
        let theSampleLines = [];
        let datafile = {};

        it('Will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "dataset data"
                }
            };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.analyzeSample(theSampleLines, datafile)).resolves.toEqual(result.data.data);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/analyze-sample', { sampleLines: theSampleLines, theDatafile: datafile });
        });

        it('Will be fail to create the dataset', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "dataset data"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.analyzeSample(theSampleLines, datafile)).resolves.toEqual({ status: -1, message: 'Failed', data: result.data.data });
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/analyze-sample', { sampleLines: theSampleLines, theDatafile: datafile });
        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error{}' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(datasetCDBService.createTenantDatabase(theClueSettings, theTenantId, theUserId)).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/analyze-sample', { sampleLines: theSampleLines, theDatafile: datafile });

        });
    });


    describe('Test startFileImporter', () => {
        let theTenantDatasetDatabaseObject = {};
        let theDfsFileUrl = 'DFS URL';
        let datafile = {};

        it('Will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "dataset data"
                }
            };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.startFileImporter(theTenantDatasetDatabaseObject, theDfsFileUrl, theClueSettings, datafile)).resolves.toEqual(result.data.data);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/import-file', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, dfsFileUrl: theDfsFileUrl, clueSetting: theClueSettings, theDatafile: datafile });
        });

        it('Will be fail to import the file', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "dataset data"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.startFileImporter(theTenantDatasetDatabaseObject, theDfsFileUrl, theClueSettings, datafile)).resolves.toEqual({ status: -1, message: 'Failed', data: result.data.data });
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/import-file', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, dfsFileUrl: theDfsFileUrl, clueSetting: theClueSettings, theDatafile: datafile });
        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(datasetCDBService.startFileImporter(theTenantDatasetDatabaseObject, theDfsFileUrl, theClueSettings, datafile)).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/import-file', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, dfsFileUrl: theDfsFileUrl, clueSetting: theClueSettings, theDatafile: datafile });

        });
    });



    describe('Test dropDataTable', () => {
        let theTenantDatasetDatabaseObject = {};
        let datafile = {};

        it('Will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "dataset data"
                }
            };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.dropDataTable(theTenantDatasetDatabaseObject, theClueSettings, datafile , 0)).resolves.toEqual(result.data.data);
            expect(httpService.put).toHaveBeenLastCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/delete-dataset-table', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, clueSetting: theClueSettings, theDatafile: datafile ,
                tableIndex: 0  });
        });

        it('Will be fail to drop the dataset', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "dataset data"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.dropDataTable(theTenantDatasetDatabaseObject, theClueSettings, datafile , 0)).resolves.toEqual({ status: -1, message: 'Failed', data: result.data.data });
            expect(httpService.put).toHaveBeenLastCalledWith('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/delete-dataset-table', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, clueSetting: theClueSettings, theDatafile: datafile ,
                tableIndex: 0 });
        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(datasetCDBService.dropDataTable(theTenantDatasetDatabaseObject, theClueSettings, datafile , 0)).resolves.toEqual(result);
            expect(httpService.put).toHaveBeenLastCalledWith('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/delete-dataset-table', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, clueSetting: theClueSettings, theDatafile: datafile  ,
                tableIndex: 0 });

        });
    });


    describe('Test dropDatabase', () => {
        let theTenantDatasetDatabaseObject = {};

        it('Will be successful', () => {
            let result = {
                data: {
                    status: 0,
                    message: "successful",
                    data: "dataset data"
                }
            };

            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.dropDatabase(theTenantDatasetDatabaseObject, theClueSettings)).resolves.toEqual(result.data.data);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
                + '/dataset-ctrl/delete-database', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, clueSetting: theClueSettings });
        });

        it('Will be fail to drop the database', () => {
            let result = {
                data: {
                    status: 10,
                    message: "failed",
                    data: "dataset data"
                }
            };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(datasetCDBService.dropDatabase(theTenantDatasetDatabaseObject, theClueSettings)).resolves.toEqual({ status: -1, message: 'Failed', data: result.data.data });
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/delete-database', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, clueSetting: theClueSettings });
        });

        it('toPromise will throw an exception', () => {
            let result = { result: 'Internal Error' };
            httpService.put.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(new Error('failed'));
            expect(datasetCDBService.dropDatabase(theTenantDatasetDatabaseObject, theClueSettings)).resolves.toEqual(result);
            expect(httpService.put).toBeCalledWith('http://' + 'dataset-controller' + ':' + '8440'
            + '/dataset-ctrl/delete-database', { tenantDatasetDatabaseObject: theTenantDatasetDatabaseObject, clueSetting: theClueSettings});

        });
    });

});
