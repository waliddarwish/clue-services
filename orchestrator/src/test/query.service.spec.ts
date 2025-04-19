import { Test } from '@nestjs/testing';
import { QueryGeneratorService } from '../../../query-generator-module/src/query-generator.service';
import { QueryExecutorService } from '../../../query-executor-module/src/query-executor.service'
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { QueryService } from '../query/query.service';



let modelObjectProvider;
let modelProvider;
let datasourceConnectionProvider;
let datasetProvider;

describe('Test query service', () => {

    let queryExecutorService;
    let queryExecutorServiceMocked = {
        executeQuery: jest.fn()
    };
    let queryGeneratorService;
    let queryGeneratorServiceMocked = {
        queryGenerator: jest.fn(),
        generateGraphByModelObjectIds: jest.fn(),
        generateGraphByModelId: jest.fn()
    };
    let globalizationService;
    let globalizationServiceMocked = {
        get: jest.fn()
    };


    let queryService;


    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: QueryGeneratorService, useFactory: () => { return queryGeneratorServiceMocked } },
                { provide: QueryExecutorService, useFactory: () => { return queryExecutorServiceMocked } },
                { provide: GlobalizationService, useFactory: () => { return globalizationServiceMocked } },
            ]
        }).compile();

        queryGeneratorService = await module.get<QueryGeneratorService>(QueryGeneratorService);
        queryExecutorService = await module.get<QueryExecutorService>(QueryExecutorService);
        globalizationService = await module.get<GlobalizationService>(GlobalizationService);

        modelObjectProvider = {
            find: jest.fn().mockImplementation(() => (modelObjectProvider)),
            exec: jest.fn()
        };
        modelProvider = {
            find: jest.fn().mockImplementation(() => (modelProvider)),
            findOne: jest.fn().mockImplementation(() => (modelProvider)),
            exec: jest.fn()
        };
        datasourceConnectionProvider = {
            find: jest.fn().mockImplementation(() => (datasourceConnectionProvider)),
            findOne: jest.fn().mockImplementation(() => (datasourceConnectionProvider)),
            exec: jest.fn()
        };
        datasetProvider = {
            find: jest.fn().mockImplementation(() => (datasetProvider)),
            findOne: jest.fn().mockImplementation(() => (datasetProvider)),
            exec: jest.fn()
        };

        queryService = new QueryService(
            queryGeneratorService, queryExecutorService, globalizationService,
            modelObjectProvider, modelProvider, datasourceConnectionProvider, datasetProvider);
    });

    describe('Test handleQuery', () => {


        it('handles query without filters and DatabaseConnection', async () => {
            let queryDefinition = {
                "projections": [
                    { "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811", "modelObjectItemId": "0f443baf-a75b-45f8-a199-86b0cb40cf02" }
                ],
                generateQueryOnly: false
            };


            let theModelObj = [{
                id: "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                dataSourceConnectionId: "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            modelObjectProvider.exec.mockReturnValueOnce(Promise.resolve(theModelObj));

            let theGreatModel = {
                datasources: [{ datasourceId: 'e2a3a2c9-32d9-47fd-972b-fed80780e87b', datasourceType: 'DatabaseConnection' }]
            };
            modelProvider.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));

            let theConnectionObj = [{ id: "4666541f-700d-4ef8-b955-2d6d3704cfae" }];
            datasourceConnectionProvider.exec.mockReturnValueOnce(Promise.resolve(theConnectionObj));

            let generatorOutput = {
                status: 0,
                data: { rows: [{ name: 'hello' }] }
            };
            queryGeneratorServiceMocked.queryGenerator.mockReturnValueOnce(Promise.resolve(generatorOutput));

            let executorOutput = {
                status: 0,
                data: { name: 'I am an executor' }
            };
            queryExecutorServiceMocked.executeQuery.mockReturnValueOnce(Promise.resolve(executorOutput));

            let result = await queryService.handleQuery(queryDefinition);
            expect(result).toEqual({ status: 0, message: executorOutput.data });

            let modelObjArray = [{
                "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                "dataSourceConnectionId": "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            let connectionArray = [{"id":"4666541f-700d-4ef8-b955-2d6d3704cfae"}];
            let datasetArray = [];
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalled();
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalledWith(modelObjArray, queryDefinition, connectionArray, datasetArray);

            expect(queryExecutorServiceMocked.executeQuery).toBeCalled();
            expect(queryExecutorServiceMocked.executeQuery).toBeCalledWith(generatorOutput.data, connectionArray, queryDefinition, modelObjArray, datasetArray);


        });



        it('handles query without filters and Dataset', async () => {
            let queryDefinition = {
                "projections": [
                    { "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811", "modelObjectItemId": "0f443baf-a75b-45f8-a199-86b0cb40cf02" }
                ],
                generateQueryOnly: false
            };


            let theModelObj = [{
                id: "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                dataSourceConnectionId: "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            modelObjectProvider.exec.mockReturnValueOnce(Promise.resolve(theModelObj));

            let theGreatModel = {
                datasources: [{ datasourceId: 'e2a3a2c9-32d9-47fd-972b-fed80780e87b', datasourceType: 'Dataset' }]
            };
            modelProvider.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));

            let theDatasetObj = { id: "4666541f-700d-4ef8-b955-2d6d3704cfae" };
            datasetProvider.exec.mockReturnValueOnce(Promise.resolve(theDatasetObj));

            let generatorOutput = {
                status: 0,
                data: { rows: [{ name: 'hello' }] }
            };
            queryGeneratorServiceMocked.queryGenerator.mockReturnValueOnce(Promise.resolve(generatorOutput));

            let executorOutput = {
                status: 0,
                data: { name: 'I am an executor' }
            };
            queryExecutorServiceMocked.executeQuery.mockReturnValueOnce(Promise.resolve(executorOutput));

            let result = await queryService.handleQuery(queryDefinition);
            expect(result).toEqual({ status: 0, message: executorOutput.data });

            let modelObjArray = [{
                "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                "dataSourceConnectionId": "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            let connectionArray = [];
            let datasetArray = [{"id":"4666541f-700d-4ef8-b955-2d6d3704cfae"}];
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalled();
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalledWith(modelObjArray, queryDefinition, connectionArray, datasetArray);

            expect(queryExecutorServiceMocked.executeQuery).toBeCalled();
            expect(queryExecutorServiceMocked.executeQuery).toBeCalledWith(generatorOutput.data, connectionArray, queryDefinition, modelObjArray, datasetArray);


        });

        it('handles query with generate query set to true', async () => {
            let queryDefinition = {
                "generateQueryOnly": true,
                "projections": [
                    { "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811", "modelObjectItemId": "0f443baf-a75b-45f8-a199-86b0cb40cf02" }
                ],

            };


            let theModelObj = [{
                id: "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                dataSourceConnectionId: "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            modelObjectProvider.exec.mockReturnValueOnce(Promise.resolve(theModelObj));

            let theGreatModel = {
                datasources: [{ datasourceId: 'e2a3a2c9-32d9-47fd-972b-fed80780e87b', datasourceType: 'Dataset' }]
            };
            modelProvider.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));

            let theDatasetObj = { id: "4666541f-700d-4ef8-b955-2d6d3704cfae" };
            datasetProvider.exec.mockReturnValueOnce(Promise.resolve(theDatasetObj));

            let generatorOutput = {
                status: 0,
                data: { rows: [{ name: 'hello' }] }
            };
            queryGeneratorServiceMocked.queryGenerator.mockReturnValueOnce(Promise.resolve(generatorOutput));


            let result = await queryService.handleQuery(queryDefinition);
            expect(result).toEqual({ status: 0, message: generatorOutput.data });

            let modelObjArray = [{
                "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                "dataSourceConnectionId": "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            let connectionArray = [];
            let datasetArray = [{"id":"4666541f-700d-4ef8-b955-2d6d3704cfae"}];
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalled();
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalledWith(modelObjArray, queryDefinition, connectionArray, datasetArray);
        });

        it('handles query with generator error', async () => {
            let queryDefinition = {
                "generateQueryOnly": true,
                "projections": [
                    { "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811", "modelObjectItemId": "0f443baf-a75b-45f8-a199-86b0cb40cf02" }
                ],

            };


            let theModelObj = [{
                id: "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                dataSourceConnectionId: "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            modelObjectProvider.exec.mockReturnValueOnce(Promise.resolve(theModelObj));

            let theGreatModel = {
                datasources: [{ datasourceId: 'e2a3a2c9-32d9-47fd-972b-fed80780e87b', datasourceType: 'Dataset' }]
            };
            modelProvider.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));

            let theDatasetObj = { id: "4666541f-700d-4ef8-b955-2d6d3704cfae" };
            datasetProvider.exec.mockReturnValueOnce(Promise.resolve(theDatasetObj));

            let generatorOutput = {
                status: -1,
                data: { rows: [{ name: 'hello' }] }
            };
            queryGeneratorServiceMocked.queryGenerator.mockReturnValueOnce(Promise.resolve(generatorOutput));
            
            let errorResult = 'theMessage';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await queryService.handleQuery(queryDefinition);
            expect(result).toEqual({ status: 15003, message: 'theMessage', data: generatorOutput.data });

            let modelObjArray = [{
                "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                "dataSourceConnectionId": "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            let connectionArray = [];
            let datasetArray = [{"id":"4666541f-700d-4ef8-b955-2d6d3704cfae"}];
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalled();
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalledWith(modelObjArray, queryDefinition, connectionArray, datasetArray);
        });



        it('handles query with executor error', async () => {
            let queryDefinition = {
                "projections": [
                    { "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811", "modelObjectItemId": "0f443baf-a75b-45f8-a199-86b0cb40cf02" }
                ],
                generateQueryOnly: false
            };


            let theModelObj = [{
                id: "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                dataSourceConnectionId: "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            modelObjectProvider.exec.mockReturnValueOnce(Promise.resolve(theModelObj));

            let theGreatModel = {
                datasources: [{ datasourceId: 'e2a3a2c9-32d9-47fd-972b-fed80780e87b', datasourceType: 'Dataset' }]
            };
            modelProvider.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));

            let theDatasetObj = { id: "4666541f-700d-4ef8-b955-2d6d3704cfae" };
            datasetProvider.exec.mockReturnValueOnce(Promise.resolve(theDatasetObj));

            let generatorOutput = {
                status: 0,
                data: { rows: [{ name: 'hello' }] }
            };
            queryGeneratorServiceMocked.queryGenerator.mockReturnValueOnce(Promise.resolve(generatorOutput));

            let executorOutput = {
                status: 10,
                data: { name: 'I am an executor' }
            };
            queryExecutorServiceMocked.executeQuery.mockReturnValueOnce(Promise.resolve(executorOutput));

            let errorResult = 'theMessage';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await queryService.handleQuery(queryDefinition);
            expect(result).toEqual(    {
                status: 15004,
                message: 'theMessage',
                data: { status: 10, data: { name: 'I am an executor' } }
              });

            let modelObjArray = [{
                "id": "a6518679-4bd9-441f-bd00-0fcccc3ee811",
                "dataSourceConnectionId": "e2a3a2c9-32d9-47fd-972b-fed80780e87b"
            }];
            let connectionArray = [];
            let datasetArray = [{"id":"4666541f-700d-4ef8-b955-2d6d3704cfae"}];
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalled();
            expect(queryGeneratorServiceMocked.queryGenerator).toBeCalledWith(modelObjArray, queryDefinition, connectionArray, datasetArray);

            expect(queryExecutorServiceMocked.executeQuery).toBeCalled();
            expect(queryExecutorServiceMocked.executeQuery).toBeCalledWith(generatorOutput.data, connectionArray, queryDefinition, modelObjArray, datasetArray);


        });

    });

    describe('Test generate graph methods', () => {

        it('Test generateGraphByModelObjectIds successfully', async () => {
            let generateGraphResult = {
                status: 0,
                data: {name: 'Thanos'}
            };
            queryGeneratorServiceMocked.generateGraphByModelObjectIds.mockReturnValueOnce(Promise.resolve(generateGraphResult));
            
            let errorResult = 'theMessage';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await queryService.generateGraphByModelObjectIds([]);
            expect(result).toEqual({ status: 0, message: generateGraphResult.data });

            expect(queryGeneratorService.generateGraphByModelObjectIds).toHaveBeenCalled();
            expect(queryGeneratorService.generateGraphByModelObjectIds).toHaveBeenCalledWith([]);
            expect(globalizationService.get).toHaveBeenCalled();
        });

        it('Test generateGraphByModelId successfully', async () => {
            let generateGraphResult = {
                status: 0,
                data: {name: 'Thanos'}
            };
            queryGeneratorServiceMocked.generateGraphByModelId.mockReturnValueOnce(Promise.resolve(generateGraphResult));
            
            let errorResult = 'theMessage';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await queryService.generateGraphByModelId('Iron man');
            expect(result).toEqual({ status: 0, message: generateGraphResult.data });

            expect(queryGeneratorService.generateGraphByModelId).toHaveBeenCalled();
            expect(queryGeneratorService.generateGraphByModelId).toHaveBeenCalledWith('Iron man');
            expect(globalizationService.get).toHaveBeenCalled();
        });


        it('Test generateGraphByModelObjectIds failed', async () => {
            let generateGraphResult = {
                status: 100,
                data: {name: 'Thanos'}
            };
            queryGeneratorServiceMocked.generateGraphByModelObjectIds.mockReturnValueOnce(Promise.resolve(generateGraphResult));
            
            let errorResult = 'theMessage';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await queryService.generateGraphByModelObjectIds([]);
            expect(result).toEqual({ status: 15001, message: errorResult, data: generateGraphResult.data });

            expect(queryGeneratorService.generateGraphByModelObjectIds).toHaveBeenCalled();
            expect(queryGeneratorService.generateGraphByModelObjectIds).toHaveBeenCalledWith([]);
            expect(globalizationService.get).toHaveBeenCalled();
        });


        it('Test generateGraphByModelId failed', async () => {
            let generateGraphResult = {
                status: 100,
                data: {name: 'Thanos'}
            };
            queryGeneratorServiceMocked.generateGraphByModelId.mockReturnValueOnce(Promise.resolve(generateGraphResult));
            
            let errorResult = 'theMessage';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await queryService.generateGraphByModelId('Iron man');
            expect(result).toEqual({ status: 15002, message: errorResult, data: generateGraphResult.data });

            expect(queryGeneratorService.generateGraphByModelId).toHaveBeenCalled();
            expect(queryGeneratorService.generateGraphByModelId).toHaveBeenCalledWith('Iron man');
            expect(globalizationService.get).toHaveBeenCalled();
        });
    });


});
