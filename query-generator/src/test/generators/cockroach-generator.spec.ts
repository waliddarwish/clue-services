import { AbstractQueryGenerator } from '../../generators/generator.base';
import { GeneratorState } from '../../generators/generator-state';
import { CockroachQueryGeneratorImpl } from '../../generators/cockroach-generator';




describe('Test cockroach query generator',  () => {
    let generatorState;
    let queryGenerator;
    let composeQueryOriginal = AbstractQueryGenerator.prototype.composeQuery;
    let mockedComposeQuery;

    beforeEach(() => {
        mockedComposeQuery = AbstractQueryGenerator.prototype.composeQuery = jest.fn();
        generatorState = new GeneratorState();
        queryGenerator = new CockroachQueryGeneratorImpl(generatorState);
        
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
        expect(generatorState.limitsClause).toEqual('LIMIT ' +  generatorState.queryDefinition.rowLimit);
    });

    it ('test building query limits without limits', () => {
        queryGenerator.buildQueryLimitsInternal();
        expect(generatorState.limitsClause).toEqual('');
    });

    it ('test building query limits = 0', () => {
        generatorState.queryDefinition.rowLimit = 0;
        queryGenerator.buildQueryLimitsInternal();
        expect(generatorState.limitsClause).toEqual('');
    });

    it('test composeQuery with limits', () => {
        generatorState.query = '';
        mockedComposeQuery.mockReturnValue('');
        generatorState.queryDefinition.rowLimit = 1000;
        queryGenerator.buildQueryLimitsInternal();
        queryGenerator.composeQuery();
        expect(generatorState.query).toEqual(' LIMIT ' +  generatorState.queryDefinition.rowLimit );
    });

    it('test composeQuery with limits = 0', () => {
        generatorState.query = '';
        mockedComposeQuery.mockReturnValue('');
        generatorState.queryDefinition.rowLimit = 0;
        queryGenerator.composeQuery();
        expect(generatorState.query).toEqual('');
    });

    it('test getDbName', ()=> {
        expect(queryGenerator.getDbName()).toEqual('Cockroach');
    });
});