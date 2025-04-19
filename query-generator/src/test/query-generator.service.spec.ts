import { Test } from '@nestjs/testing';
import { LogService } from '../../../log-module/src/log.service';
import { QueryGeneratorService } from '../query-generator.service';
import queryGeneratorFactory = require('../generators/generator.factory');
import { GeneratorStateMachine } from '../state-machine/GeneratorStateMachine';



let modelObjectProviderMocked = {
    exec: jest.fn(),
    find: jest.fn().mockImplementation(() => (modelObjectProviderMocked)),
    findOne: jest.fn().mockImplementation(() => (modelObjectProviderMocked)),

};
let logService;
let queryGeneratorService;
let modelProviderMocked = {
    exec: jest.fn(),
    find: jest.fn().mockImplementation(() => (modelProviderMocked)),
    findOne: jest.fn().mockImplementation(() => (modelProviderMocked)),
};
let dsConnectionModelMocked = {
    exec: jest.fn(),
    find: jest.fn().mockImplementation(() => (dsConnectionModelMocked)),
};
let datasetProviderMocked = {
    exec: jest.fn(),
    findOne: jest.fn().mockImplementation(() => (datasetProviderMocked)),
};
let logServiceMocked = {};
let generator ;

let generatorStateMachine_startStateMachine_original = GeneratorStateMachine.prototype.startStateMachine;
let queryGenerator_generateGraphForModelObjects_original = QueryGeneratorService.prototype.generateGraphForModelObjects;



describe('Test query generator service',  () => {



    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {provide: LogService, useFactory: () => {return logServiceMocked}}
            ]
        }).compile();
    
        logService = await module.get<LogService>(LogService);
        queryGeneratorService = new QueryGeneratorService(modelObjectProviderMocked, modelProviderMocked, dsConnectionModelMocked, datasetProviderMocked, logService);
        generator = {
            startStateMachine: jest.fn(),
            getModelGraph: jest.fn(),
            generatorState: {
                result: 0,
                query: 'select bla from bla', 
                wrapColumnNameInDoubleQuotes: true, 
                serialezedTableGraph: {}, 
                resultMessage: ''
            }
        };
        jest.genMockFromModule('../generators/generator.factory');
        jest.mock('../generators/generator.factory');

        jest.genMockFromModule('../state-machine/GeneratorStateMachine');
        jest.mock('../state-machine/GeneratorStateMachine', () => {
            return jest.fn().mockImplementation(() => {
                return generator;
              });
        });

    });

    afterEach( () => {
        GeneratorStateMachine.prototype.startStateMachine = generatorStateMachine_startStateMachine_original;
        QueryGeneratorService.prototype.generateGraphForModelObjects = queryGenerator_generateGraphForModelObjects_original;
    });

    describe('test QueryGeneratorService.generateQuery', () => {

        it('generate query successfully', async () => {
            let expectedResult = { status: 0, data: 'select bla from bla' };
            GeneratorStateMachine.prototype.startStateMachine = jest.fn().mockReturnValue(() => generator);
            queryGeneratorFactory.instantiateWithConnection = jest.fn().mockReturnValue(generator);
            let result = await queryGeneratorService.generateQuery({}, [], [], []);
            expect(result).toEqual(expectedResult);
        });

        it('fail to instantiate generator ', async () => {
            let expectedResult = { status: -1, data: 'Failed to instantiate generator' };
            queryGeneratorFactory.instantiateWithConnection = jest.fn().mockReturnValue(null);
            let result = await queryGeneratorService.generateQuery({}, [], [], []);
            expect(result).toEqual(expectedResult);
        });

    });


    describe('test QueryGeneratorService.generateGraphByModelId' , () => {

        it('generateGraphByModelId successfully', async () => {
            let expectedResult = {val: 'Hello from clue'};
            modelObjectProviderMocked.exec.mockResolvedValue(() => {[]});
            QueryGeneratorService.prototype.generateGraphForModelObjects = jest.fn().mockReturnValue(Promise.resolve(expectedResult));
            let result = await queryGeneratorService.generateGraphByModelId('clueModelId');
            expect(result).toEqual(expectedResult);
        });

        it('generateGraphByModelId throw exception', async () => {
            let expectedResult = new Error('failed');
            QueryGeneratorService.prototype.generateGraphForModelObjects = jest.fn().mockReturnValue(Promise.resolve(expectedResult));

            modelObjectProviderMocked.exec.mockResolvedValue(expectedResult);
            let result = await queryGeneratorService.generateGraphByModelId('clueModelId');
            expect(result).toEqual(expectedResult);            
        });

    });


    describe('test QueryGeneratorService.generateGraphByModelObjectIds' , () => {
        let clueModelObject = {
            modelObjectItems : [
                {isPrimaryKey: true, nameInDatasource: 'col1'},
                {isPrimaryKey: false, nameInDatasource: 'col2'}    
            ]
        };

        let modelObject = {
            modelObjectItems : [
                {isPrimaryKey: true, isForeignKey: false, nameInDatasource: 'col11'},
                {isPrimaryKey: false, isForeignKey: true, nameInDatasource: 'col22', foreignTableSchema: 'schema', foreignTableName: 'table', foreignTableColumnName: 'f_col2' }    
            ]
        };
        it ('generate graph successfully', async () => {
            let expectedResult = {val: 'Hello from clue'};
            QueryGeneratorService.prototype.generateGraphForModelObjects = jest.fn().mockReturnValue(Promise.resolve(expectedResult));
            modelObjectProviderMocked.exec.mockReturnValueOnce(Promise.resolve(clueModelObject));
            modelObjectProviderMocked.exec.mockReturnValueOnce(Promise.resolve([modelObject]));
            let result = await queryGeneratorService.generateGraphByModelObjectIds([{id: 'id'}]);
            expect(result).toEqual(expectedResult);            



        });
    
    });

    describe('test QueryGeneratorService.generateGraphForModelObjects' , () => {
        let clueModelObject = {
            dataSourceConnectionId: '12345',
            modelObjectItems : [
                {isPrimaryKey: true, isForeignKey: false, nameInDatasource: 'col11'},
                {isPrimaryKey: false, isForeignKey: true, nameInDatasource: 'col22', foreignTableSchema: 'schema', foreignTableName: 'table', foreignTableColumnName: 'f_col2' }    
            ]
        };
        let theGreatModel = {
            datasources : [
                {datasourceId: '12345', datasourceType : 'DatabaseConnection'}
            ]
        };
        
        let theConnectionObj = [{id: '12345'}];

        it('generates a graph successfully with focused node id', async () => {
            let expectedResult ={
                status: 0,
                data: { focusedNodeId: 'focusedNodeId', graph: { graph: 'graph' } }};
            generator.generatorState.wrapColumnNameInDoubleQuotes = true;
            generator.generatorState.serialezedTableGraph = {graph: 'graph'};
            generator.generatorState.result = 0;
            modelProviderMocked.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));
            dsConnectionModelMocked.exec.mockReturnValueOnce(Promise.resolve(theConnectionObj));
            queryGeneratorFactory.instantiateWithConnection = jest.fn().mockReturnValue(generator);

            let result = await queryGeneratorService.generateGraphForModelObjects([clueModelObject], 'focusedNodeId');

            expect(result).toEqual(expectedResult);
        });

        it('generates a graph successfully without focused node id', async () => {
            let expectedResult = { status: 0, data: { graph: 'graph' } };
            generator.generatorState.wrapColumnNameInDoubleQuotes = true;
            generator.generatorState.serialezedTableGraph = {graph: 'graph'};
            generator.generatorState.result = 0;
            modelProviderMocked.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));
            dsConnectionModelMocked.exec.mockReturnValueOnce(Promise.resolve(theConnectionObj));
            queryGeneratorFactory.instantiateWithConnection = jest.fn().mockReturnValue(generator);

            let result = await queryGeneratorService.generateGraphForModelObjects([clueModelObject]);
            expect(result).toEqual(expectedResult);
        });

        it('generator would return non zero result', async () => {
            let expectedResult = { status: 10, data: 'failed' };
            generator.generatorState.wrapColumnNameInDoubleQuotes = true;
            generator.generatorState.serialezedTableGraph = {graph: 'graph'};
            generator.generatorState.result = 10;
            generator.generatorState.resultMessage = 'failed';
            modelProviderMocked.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));
            dsConnectionModelMocked.exec.mockReturnValueOnce(Promise.resolve(theConnectionObj));
            queryGeneratorFactory.instantiateWithConnection = jest.fn().mockReturnValue(generator);

            let result = await queryGeneratorService.generateGraphForModelObjects([clueModelObject]);
            expect(result).toEqual(expectedResult);
        });


        it('generates a graph successfully for dataset', async () => {
            theGreatModel.datasources[0].datasourceType = 'Dataset'
            let expectedResult = { status: 0, data: { graph: 'graph' } };
            generator.generatorState.wrapColumnNameInDoubleQuotes = true;
            generator.generatorState.serialezedTableGraph = {graph: 'graph'};
            generator.generatorState.result = 0;
            modelProviderMocked.exec.mockReturnValueOnce(Promise.resolve(theGreatModel));
            datasetProviderMocked.exec.mockReturnValueOnce(Promise.resolve(theConnectionObj));
            queryGeneratorFactory.instantiateWithConnection = jest.fn().mockReturnValue(generator);
            let result = await queryGeneratorService.generateGraphForModelObjects([clueModelObject]);
            expect(result).toEqual(expectedResult);
        });
    });


});