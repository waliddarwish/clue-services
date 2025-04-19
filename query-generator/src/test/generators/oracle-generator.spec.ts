import { AbstractQueryGenerator } from '../../generators/generator.base';
import { GeneratorState } from '../../generators/generator-state';
import { OracleQueryGeneratorImpl } from '../../generators/oracle-generator';




describe('Test postgres query generator',  () => {
    let generatorState;
    let queryGenerator;
    let composeQueryOriginal = AbstractQueryGenerator.prototype.composeQuery;
    let mockedComposeQuery;

    beforeEach(() => {
        mockedComposeQuery = AbstractQueryGenerator.prototype.composeQuery = jest.fn();
        generatorState = new GeneratorState();
        queryGenerator = new OracleQueryGeneratorImpl(generatorState);
        
        generatorState.queryDefinition = {
            selectDistinct: false,
            projections: [], 
            filters: [],
            rowLimit: 0
        };
    });

    afterEach(() => {
        AbstractQueryGenerator.prototype.composeQuery = composeQueryOriginal;
    });

    it ('test building query limits', () => {
        generatorState.queryDefinition.rowLimit = 1000;
        queryGenerator.buildQueryLimitsInternal();
        expect(generatorState.limitsClause).toEqual('rownum <= ' +  generatorState.queryDefinition.rowLimit);
    });

    it ('test building query limits without limits', () => {
        queryGenerator.buildQueryLimitsInternal();
        expect(generatorState.limitsClause).toEqual('');
    });

    it('test composeQuery with empty join clause', ()=>{
        generatorState.joinClause = '';
        mockedComposeQuery.mockReturnValue('');
        generatorState.queryDefinition.rowLimit = 1000;
        queryGenerator.buildQueryLimitsInternal();
        queryGenerator.composeQuery();

        expect(generatorState.joinClause).toEqual('WHERE ' + generatorState.limitsClause);

    });

    it('test composeQuery with non empty join clause', ()=>{
        generatorState.joinClause = 'where id = 1';
        mockedComposeQuery.mockReturnValue('');
        generatorState.queryDefinition.rowLimit = 1000;
        queryGenerator.buildQueryLimitsInternal();
        queryGenerator.composeQuery();

        expect(generatorState.joinClause).toEqual('where id = 1 and ' + generatorState.limitsClause);

    });


    it('test getDbName', ()=> {
        expect(queryGenerator.getDbName()).toEqual('Oracle');
    });
});