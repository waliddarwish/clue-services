import { Test } from '@nestjs/testing';
import { GeneratorState } from '../../generators/generator-state';
import { AbstractQueryGenerator } from '../../generators/generator.base';
import e from 'express';
import { concat } from 'rxjs';

class DummyGenerator extends AbstractQueryGenerator {
    protected getDbName(): string {
        return 'Dummy';
    }
    protected buildQueryLimitsInternal() {
        console.log('internal query limits');
    }
}
describe('Test query base generator', () => {

    let generatorState;
    let queryGenerator;
    let validateInputOrignal = AbstractQueryGenerator.prototype.validateInput;
    let buildSelectClauseOriginal = AbstractQueryGenerator.prototype.buildSelectClause;
    let buildFromClauseOriginal = AbstractQueryGenerator.prototype.buildFromClause;
    let buildWhereClauseOriginal = AbstractQueryGenerator.prototype.buildWhereClause;
    let buildGroupByClauseOriginal = AbstractQueryGenerator.prototype.buildGroupByClause;
    let buildHavingClauseOriginal = AbstractQueryGenerator.prototype.buildHavingClause;
    let buildOrderByClauseOriginal = AbstractQueryGenerator.prototype.buildOrderByClause;
    let buildQueryLimitsOriginal = AbstractQueryGenerator.prototype.buildQueryLimits;
    let handleProjectItemOriginal = AbstractQueryGenerator.prototype.handleProjectItem;
    let handleProjectionItemFiltersOriginal = AbstractQueryGenerator.prototype.handleProjectionItemFilters;
    let getModelGraphOriginal = AbstractQueryGenerator.prototype.getModelGraph;
    let extractEligibleJoinPathsOriginal = AbstractQueryGenerator.prototype.extractEligibleJoinPaths;
    let buildJoinClauseOriginal = AbstractQueryGenerator.prototype.buildJoinClause;
    let handleProjectionItemSortOriginal = AbstractQueryGenerator.prototype.handleProjectionItemSort;
    let prepareHavingItemsOriginal = AbstractQueryGenerator.prototype.prepareHavingItems;
    let getConnectionOriginal = AbstractQueryGenerator.prototype.getConnection;
    let getModelByIdOriginal = AbstractQueryGenerator.prototype.getModelById;
    let getModelItemByIdOriginal = AbstractQueryGenerator.prototype.getModelItemById;
    let getProjectionItemByModelObjectItemId = AbstractQueryGenerator.prototype.getProjectionItemByModelObjectItemId;
    let getValueFromDbMapOriginal = AbstractQueryGenerator.prototype.getValueFromDbMap;
    let getValueFromDbMapByFieldNameOriginal = AbstractQueryGenerator.prototype.getValueFromDbMapByFieldName;
    let formatProjectionNameInDataSourceOriginal = AbstractQueryGenerator.prototype.formatProjectionNameInDataSource;



    beforeEach(() => {
        generatorState = new GeneratorState();
        queryGenerator = new DummyGenerator(generatorState);

        generatorState.queryDefinition = {
            selectDistinct: false,
            projections: [], 
            filters: []
        };

        generatorState.fromTables = ['table1', 'table2'];
        generatorState.groupByItems = ['item1', 'item2', 'item3'];
        generatorState.havingItems = ['having_item1', 'having_item2', 'having_item3'];
        generatorState.orderByItems = ['order_by_item1', 'order_by_item2', 'order_by_item3'];
    });


    afterEach(() => {

        AbstractQueryGenerator.prototype.validateInput = validateInputOrignal;
        AbstractQueryGenerator.prototype.buildSelectClause = buildSelectClauseOriginal;
        AbstractQueryGenerator.prototype.buildFromClause = buildFromClauseOriginal;
        AbstractQueryGenerator.prototype.buildWhereClause = buildWhereClauseOriginal;
        AbstractQueryGenerator.prototype.buildGroupByClause = buildGroupByClauseOriginal;
        AbstractQueryGenerator.prototype.buildHavingClause = buildHavingClauseOriginal;
        AbstractQueryGenerator.prototype.buildOrderByClause = buildOrderByClauseOriginal;
        AbstractQueryGenerator.prototype.buildQueryLimits = buildQueryLimitsOriginal;
        AbstractQueryGenerator.prototype.handleProjectItem = handleProjectItemOriginal;
        AbstractQueryGenerator.prototype.handleProjectionItemFilters = handleProjectionItemFiltersOriginal;
        AbstractQueryGenerator.prototype.getModelGraph = getModelGraphOriginal;
        AbstractQueryGenerator.prototype.extractEligibleJoinPaths = extractEligibleJoinPathsOriginal;
        AbstractQueryGenerator.prototype.buildJoinClause = buildJoinClauseOriginal;
        AbstractQueryGenerator.prototype.handleProjectionItemSort = handleProjectionItemSortOriginal;
        AbstractQueryGenerator.prototype.prepareHavingItems = prepareHavingItemsOriginal;
        AbstractQueryGenerator.prototype.getConnection = getConnectionOriginal;
        AbstractQueryGenerator.prototype.getModelById = getModelByIdOriginal;
        AbstractQueryGenerator.prototype.getModelItemById = getModelItemByIdOriginal;
        AbstractQueryGenerator.prototype.getProjectionItemByModelObjectItemId = getProjectionItemByModelObjectItemId;
        AbstractQueryGenerator.prototype.getValueFromDbMap = getValueFromDbMapOriginal;
        AbstractQueryGenerator.prototype.getValueFromDbMapByFieldName = getValueFromDbMapByFieldNameOriginal;
        AbstractQueryGenerator.prototype.formatProjectionNameInDataSource = formatProjectionNameInDataSourceOriginal;

    });


    describe('Test validateInput', () => {
        // We still need to implement this method!
        it('validates input successfully', () => {
            queryGenerator.validateInput();
        })
    });

    describe('Test buildSelectClause', () => {
        let selectQuery = 'select Bla from bla xy';
        beforeEach(() => {
            generatorState.queryDefinition.projections.push({ item: 'item id' });
            AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn().mockReturnValue('distinct');
            AbstractQueryGenerator.prototype.getModelById = jest.fn().mockImplementation(() => { theModel: { } });
            AbstractQueryGenerator.prototype.getModelItemById = jest.fn().mockImplementation(() => { theModelItem: { } });
            AbstractQueryGenerator.prototype.handleProjectItem = jest.fn().mockImplementation(() => { processedProjectionItem: { } });
            AbstractQueryGenerator.prototype.handleProjectionItemFilters = jest.fn().mockImplementation(() => { handleProjectionItemFilters: { } });
        });

        it('build select clause successfully', () => {

            let expectedQuery = 'select Bla from bla ';
            AbstractQueryGenerator.prototype.handleProjectionItemSort = jest.fn().mockImplementation(() => { generatorState.selectClause = selectQuery });
            queryGenerator.buildSelectClause();
            expect(generatorState.selectClause).toEqual(expectedQuery);
        });

        it('build select clause with Distinct successfully', () => {
            generatorState.queryDefinition.selectDistinct = true;
            AbstractQueryGenerator.prototype.handleProjectionItemSort = jest.fn().mockImplementation(() => { generatorState.selectClause = generatorState.selectClause + ' column1 from table2, ' });
            queryGenerator.buildSelectClause();
            expect(generatorState.selectClause).toEqual('SELECT distinct  column1 from table2');
        });

    });

    describe('Test buildFromClause', () => {
        it('build from clause successfully from two tables', () => {
            queryGenerator.buildFromClause();
            expect(generatorState.fromClause).toEqual('From table1, table2 ');
        });
        it('build from clause successfully from one table', () => {
            generatorState.fromTables = ['tableA'];
            queryGenerator.buildFromClause();
            expect(generatorState.fromClause).toEqual('From tableA ');
        });
    });

    describe('Test buildWhereClause', () => {

        beforeEach(() => {
            AbstractQueryGenerator.prototype.getModelGraph = jest.fn();
            AbstractQueryGenerator.prototype.extractEligibleJoinPaths = jest.fn().mockReturnValue({ value: 'val' });
            AbstractQueryGenerator.prototype.buildJoinClause = jest.fn();
        });

        it('call build where successfully', () => {
            queryGenerator.buildWhereClause();
        });
    });

    describe('Test buildGroupByClause', () => {

        beforeEach(() => {
            AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn().mockReturnValue('group by');
        });

        it('build group by successfully', () => {
            queryGenerator.buildGroupByClause();
            expect(generatorState.groupByClause).toEqual('group by item1, item2, item3');
        });

        it('build group by successfully with one item', () => {
            generatorState.groupByItems = ['itemA'];
            queryGenerator.buildGroupByClause();
            expect(generatorState.groupByClause).toEqual('group by itemA');
        });

        it('build group by successfully when we do not have items', () => {
            generatorState.groupByItems = [];
            queryGenerator.buildGroupByClause();
            expect(generatorState.groupByClause).toEqual('');
        });
    });


    describe('Test buildHavingClause', () => {

        beforeEach(() => {
            AbstractQueryGenerator.prototype.prepareHavingItems = jest.fn();
            let getValFromDb = AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn();
            getValFromDb.mockReturnValueOnce('having');
            getValFromDb.mockReturnValueOnce('and');

        });

        it('build having successfully', () => {
            queryGenerator.buildHavingClause();
            expect(generatorState.havingClause).toEqual('having having_item1 and having_item2 and having_item3');
        });

        it('build group by successfully with one item', () => {
            generatorState.havingItems = ['having_itemA'];
            queryGenerator.buildHavingClause();
            expect(generatorState.havingClause).toEqual('having having_itemA');
        });

        it('build group by successfully when we do not have items', () => {
            generatorState.havingItems = [];
            queryGenerator.buildHavingClause();
            expect(generatorState.havingClause).toEqual('');
        });
    });



    describe('Test buildOrderByClause', () => {

        beforeEach(() => {
            AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn().mockReturnValue('order by');
        });

        it('build order by successfully', () => {
            queryGenerator.buildOrderByClause();
            expect(generatorState.orderByClause).toEqual('order by order_by_item1, order_by_item2, order_by_item3');
        });

        it('build order by successfully with one item', () => {
            generatorState.orderByItems = ['itemA'];
            queryGenerator.buildOrderByClause();
            expect(generatorState.orderByClause).toEqual('order by itemA');
        });

        it('build group by successfully when we do not have items', () => {
            generatorState.orderByItems = [];
            queryGenerator.buildOrderByClause();
            expect(generatorState.orderByClause).toEqual('');
        });
    });

    describe('Test buildQueryLimits', () => {
        it('build query limits successfully', () => {
            queryGenerator.buildQueryLimits();
            //expect(queryGenerator.buildQueryLimitsInternal()).toHaveBeenCalled();
        });
    });

    describe('Test composeQuery', () => {
        it('compose query successfully', () => {
            generatorState.selectClause = 'select column1';
            generatorState.fromClause = 'from table2';
            generatorState.joinClause = 'where column2 = column3';
            generatorState.groupByClause = 'group by column4';
            generatorState.havingClause = 'having column5 > 20';
            generatorState.orderByClause = 'order by column6';

            queryGenerator.composeQuery();
            expect(generatorState.query).toEqual('select column1 from table2 where column2 = column3 group by column4 having column5 > 20 order by column6');
        });
    });

    //handleProjectItem

    describe('Test handleProjectItem', () => {
        let mockedFormatProjectionNameInDataSource;
        let mockedGetValueFromDbMap;
        let mockedGetValueFromDbMapByFieldName;

        beforeEach(() => {
            generatorState.selectClause = 'select ';
            mockedFormatProjectionNameInDataSource = AbstractQueryGenerator.prototype.formatProjectionNameInDataSource = jest.fn();
            mockedGetValueFromDbMap = AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn();
            mockedGetValueFromDbMapByFieldName = AbstractQueryGenerator.prototype.getValueFromDbMapByFieldName = jest.fn();
        });
        it('Test handleProjectItem with projectionItemAggregation = None', () => {
            let projectionItemAggregation = 'None';
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id'
            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);

            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('dvdrentals.public.customers.customer_id');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
                "dvdrentals.public.customers.customer_id",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers']);
            expect(generatorState.selectClause).toEqual('select dvdrentals.public.customers.customer_id AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });

        it('Test handleProjectItem with projectionItemAggregation = None and new from table', () => {
            let projectionItemAggregation = 'None';
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id'
            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce('dvdrentals.public.sales');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce('dvdrentals.public.sales');

            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('dvdrentals.public.customers.customer_id');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
                "dvdrentals.public.customers.customer_id",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers', 'dvdrentals.public.sales']);
            expect(generatorState.selectClause).toEqual('select dvdrentals.public.customers.customer_id AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });


        it('Test handleProjectItem with projectionItemAggregation = Count', () => {
            let projectionItemAggregation = 'Count';
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id'
            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedGetValueFromDbMapByFieldName.mockReturnValue('Count');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);



            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('Count(dvdrentals.public.customers.customer_id)');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers']);
            expect(generatorState.selectClause).toEqual('select Count(dvdrentals.public.customers.customer_id) AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });



        it('Test projectionItemAggregation = null and theModelItem.usage= fact and defaultAggregation is None', () => {
            let projectionItemAggregation = null;
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
                usage: 'Fact',
                defaultAggregation: 'None'

            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);


            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('dvdrentals.public.customers.customer_id');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
                "dvdrentals.public.customers.customer_id",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers']);
            expect(generatorState.selectClause).toEqual('select dvdrentals.public.customers.customer_id AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });

        it('Test projectionItemAggregation = null and theModelItem.usage= fact and defaultAggregation is null', () => {
            let projectionItemAggregation = null;
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
                usage: 'Fact',

            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);


            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('dvdrentals.public.customers.customer_id');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
                "dvdrentals.public.customers.customer_id",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers']);
            expect(generatorState.selectClause).toEqual('select dvdrentals.public.customers.customer_id AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });


        it('Test projectionItemAggregation = null and theModelItem.usage = fact and defaultAggregation is Sum', () => {
            let projectionItemAggregation = null;
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
                usage: 'Fact',
                defaultAggregation: 'Sum'

            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedGetValueFromDbMapByFieldName.mockReturnValue('Sum');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);


            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('Sum(dvdrentals.public.customers.customer_id)');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers']);
            expect(generatorState.selectClause).toEqual('select Sum(dvdrentals.public.customers.customer_id) AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });


        it('Test projectionItemAggregation = null and theModelItem.usage= Dimension ', () => {
            let projectionItemAggregation = null;
            let projectionItemSort = {};
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
                usage: 'Dimension',

            };
            let theModel = {
            };
            generatorState.fromTables = ['dvdrentals.public.customers'];
            let connectionType = '';
            let projectionItemId = '7af33b62-4c2a-45cc-b57a-4b1b78cc696b';

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMap.mockReturnValue('AS ' + ' \"' + projectionItemId + '\"');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);


            let result = queryGenerator.handleProjectItem(projectionItemAggregation, projectionItemSort, theModelItem, theModel, connectionType, projectionItemId);
            expect(result).toEqual('dvdrentals.public.customers.customer_id');
            expect(generatorState.groupByItems).toEqual([
                "item1",
                "item2",
                "item3",
                "dvdrentals.public.customers.customer_id",
            ]);
            expect(generatorState.fromTables).toEqual(['dvdrentals.public.customers']);
            expect(generatorState.selectClause).toEqual('select dvdrentals.public.customers.customer_id AS  "7af33b62-4c2a-45cc-b57a-4b1b78cc696b" "7af33b62-4c2a-45cc-b57a-4b1b78cc696b", ');
        });

    });


    describe('Test handleProjectionItemFilters', () => {
        let mockedFormatProjectionNameInDataSource;
        let mockedGetValueFromDbMapByFieldName;
        let mockedGetModelItemById;
        let mockedGetModelById;
        let connectionType = 'iron man db';

        beforeEach(() => {
            mockedFormatProjectionNameInDataSource = AbstractQueryGenerator.prototype.formatProjectionNameInDataSource = jest.fn();
            mockedGetValueFromDbMapByFieldName = AbstractQueryGenerator.prototype.getValueFromDbMapByFieldName = jest.fn();
            mockedGetModelItemById = AbstractQueryGenerator.prototype.getModelItemById = jest.fn();
            mockedGetModelById = AbstractQueryGenerator.prototype.getModelById = jest.fn();
        });

        it('test without filter left side ', () => {
            let filters = [{
                operator: 'is null'
            }];
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_name',
            };

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMapByFieldName.mockReturnValueOnce(filters[0].operator);

            queryGenerator.handleProjectionItemFilters(filters, theModelItem, connectionType);
            expect(generatorState.projectionFilterItems).toEqual(['dvdrentals.public.customers.customer_name is null ']);
        });

        it('test with filter left side is not a valid uuid', () => {
            let filters = [{
                operator: '>=',
                leftSide: 20389
            }];
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
            };

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMapByFieldName.mockReturnValueOnce(filters[0].operator);

            queryGenerator.handleProjectionItemFilters(filters, theModelItem, connectionType);
            expect(generatorState.projectionFilterItems).toEqual(["dvdrentals.public.customers.customer_id >= '20389'"]);
        });

        it('test with filter left side is a valid uuid', () => {
            let filters = [{
                operator: '>=',
                leftSide: 'b08952ac-302f-4f14-9a45-1a11008f30b6'
            }];
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
            };

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMapByFieldName.mockReturnValueOnce(filters[0].operator);
            mockedGetModelItemById.mockReturnValueOnce('');
            mockedGetModelById.mockReturnValueOnce('');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce('dvdrentals.schema2.customers.customer_id');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(generatorState.fromTables[0]);
            expect(generatorState.fromTables).toEqual([
                "table1",
                "table2",]);

            queryGenerator.handleProjectionItemFilters(filters, theModelItem, connectionType);
            expect(generatorState.projectionFilterItems).toEqual(["dvdrentals.public.customers.customer_id >= dvdrentals.schema2.customers.customer_id"]);
        });

        it('test with filter left side is a valid uuid and new from table', () => {
            let filters = [{
                operator: '>=',
                leftSide: 'b08952ac-302f-4f14-9a45-1a11008f30b6'
            }];
            let theModelItem = {
                nameInDatasource: 'dvdrentals.public.customers.customer_id',
            };

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(theModelItem.nameInDatasource);
            mockedGetValueFromDbMapByFieldName.mockReturnValueOnce(filters[0].operator);
            mockedGetModelItemById.mockReturnValueOnce('');
            mockedGetModelById.mockReturnValueOnce('');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce('dvdrentals.schema2.customers.customer_id');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce('dvdrentals.schema2.customers');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce('dvdrentals.schema2.customers');


            queryGenerator.handleProjectionItemFilters(filters, theModelItem, connectionType);
            expect(generatorState.projectionFilterItems).toEqual(["dvdrentals.public.customers.customer_id >= dvdrentals.schema2.customers.customer_id"]);
            expect(generatorState.fromTables).toEqual([
                "table1",
                "table2",
                "dvdrentals.schema2.customers",]);
        });
    });


    describe('Test getModelGraph', () => {
        let mockedGetValueFromDbMap;
        let mockedFormatProjectionNameInDataSource;
        let DotSeparator = '.';
        let expectedTableGraph = {
            nodes: [ { id: 'public.city' }, { id: 'public.address' } ],
            links: [
              {
                source: 'public.city',
                target: 'public.address',
                weight: 1,
                info: 'public.address.city_id = public.city.city_id'
              },
              {
                source: 'public.address',
                target: 'public.city',
                weight: 1,
                info: 'public.address.city_id = public.city.city_id'
              }
            ]
          };
        let expectedColumnGraph =           {
            nodes: [
              { id: 'public.address.city_id' },
              { id: 'public.city.city_id' },
              { id: 'public.address.address_id' }
            ],
            links: [
              {
                source: 'public.address.city_id',
                target: 'public.city.city_id',
                weight: 1,
                info: ''
              },
              {
                source: 'public.city.city_id',
                target: 'public.address.city_id',
                weight: 1,
                info: ''
              }
            ]
          };

        beforeEach(() => {
            mockedGetValueFromDbMap = AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn();
            mockedFormatProjectionNameInDataSource = AbstractQueryGenerator.prototype.formatProjectionNameInDataSource = jest.fn();
        });

        it('generate graph', () => {
            let models = [{
                "nameInDatasource": "public.address",
                modelObjectItems: [
                    {
                        "usage": "Dimension",
                        "usageType": "Number",
                        "defaultAggregation": "Count",
                        "defaultFormat": "",
                        "isPrimaryKey": false,
                        "isForeignKey": true,
                        "sourceSchema": "public",
                        "sourceTable": "address",
                        "foreignTableSchema": "public",
                        "foreignTableName": "city",
                        "foreignTableColumnName": "city_id",
                        "constraintType": "FOREIGN KEY",
                        "_id": {
                            "$oid": "5eb1278ce84d1a0fc294b627"
                        },
                        "modelObjectItemId": "61341d82-362f-4b3f-9762-c2ace8bad2a4",
                        "nameInDatasource": "public.address.city_id",
                        "prettyName": "city id",
                        "columnName": "city_id",
                        "dataTypeInDataSource": "smallint",
                        "dataLength": 0,
                        "precisionInDataSource": 16,
                        "decimalPoints": 0
                    },
                    {
                        "usage": "Dimension",
                        "usageType": "Number",
                        "defaultAggregation": "Sum",
                        "defaultFormat": "",
                        "isPrimaryKey": true,
                        "isForeignKey": false,
                        "sourceSchema": "public",
                        "sourceTable": "address",
                        "foreignTableSchema": "public",
                        "foreignTableName": "address",
                        "foreignTableColumnName": "address_id",
                        "constraintType": "PRIMARY KEY",
                        "_id": {
                            "$oid": "5eb1278ce84d1a0fc294b623"
                        },
                        "modelObjectItemId": "5d05808c-4968-43c4-a8a3-f24addfdcbfe",
                        "nameInDatasource": "public.address.address_id",
                        "prettyName": "address id",
                        "columnName": "address_id",
                        "dataTypeInDataSource": "integer",
                        "dataLength": 0,
                        "precisionInDataSource": 32,
                        "decimalPoints": 0
                    },
                    {
                        "usage": "Dimension",
                        "usageType": "Timestamp",
                        "defaultAggregation": "Count",
                        "defaultFormat": "",
                        "isPrimaryKey": false,
                        "isForeignKey": false,
                        "sourceSchema": null,
                        "sourceTable": null,
                        "foreignTableSchema": null,
                        "foreignTableName": null,
                        "foreignTableColumnName": null,
                        "constraintType": null,
                        "_id": {
                            "$oid": "5eb1278ce84d1a0fc294b622"
                        },
                        "modelObjectItemId": "3f04ab56-dd13-42e2-b848-fe4c835442f0",
                        "nameInDatasource": "public.address.last_update",
                        "prettyName": "last update",
                        "columnName": "last_update",
                        "dataTypeInDataSource": "timestamp without time zone",
                        "dataLength": 0,
                        "precisionInDataSource": 0,
                        "decimalPoints": 0
                    } 
                ]
            }];
            generatorState.models = models;

            mockedGetValueFromDbMap.mockReturnValueOnce('PRIMARY KEY');
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(models[0].modelObjectItems[0].sourceSchema + DotSeparator + models[0].modelObjectItems[0].sourceTable);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(models[0].modelObjectItems[0].foreignTableSchema + DotSeparator + models[0].modelObjectItems[0].foreignTableName);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(models[0].modelObjectItems[0].foreignTableSchema + DotSeparator + models[0].modelObjectItems[0].foreignTableName + DotSeparator +
                models[0].modelObjectItems[0].foreignTableColumnName);

            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(models[0].modelObjectItems[0].nameInDatasource);
                
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(models[0].nameInDatasource);
            mockedFormatProjectionNameInDataSource.mockReturnValueOnce(models[0].modelObjectItems[1].nameInDatasource);
       
            queryGenerator.getModelGraph();
            expect(generatorState.result).toEqual(0);
            expect(generatorState.resultMessage).toEqual("Success");
            expect(generatorState.serialezedTableGraph).toEqual(expectedTableGraph);
            expect(generatorState.serializedColumnGraph).toEqual(expectedColumnGraph);
       
        });



        
        describe('Test extractEligibleJoinPaths', () => {
            let serializedTableGraph = { "nodes": [{ "id": "\"public\".\"staff\"" }, { "id": "\"public\".\"address\"" }, { "id": "\"public\".\"store\"" }], "links": [{ "source": "\"public\".\"staff\"", "target": "\"public\".\"address\"", "weight": 1, "info": "\"public\".\"staff\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"staff\"", "target": "\"public\".\"store\"", "weight": 1, "info": "\"public\".\"store\".\"manager_staff_id\" = \"public\".\"staff\".\"staff_id\"" }, { "source": "\"public\".\"address\"", "target": "\"public\".\"staff\"", "weight": 1, "info": "\"public\".\"staff\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"address\"", "target": "\"public\".\"store\"", "weight": 1, "info": "\"public\".\"store\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"store\"", "target": "\"public\".\"address\"", "weight": 1, "info": "\"public\".\"store\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"store\"", "target": "\"public\".\"staff\"", "weight": 1, "info": "\"public\".\"store\".\"manager_staff_id\" = \"public\".\"staff\".\"staff_id\"" }] };
            let fromTables = ['"public"."staff"', '"public"."store"'];

            beforeEach(() => {

            });

            it('build extractEligibleJoinPaths', () => {
                let expectedResult = [
                    [ '"public"."store"', '"public"."staff"' ],
                    [ '"public"."staff"', '"public"."store"' ]
                  ];
                let expectedEligibleJoinPath =[
                    [ '"public"."store"', '"public"."address"', '"public"."staff"' ],
                    [ '"public"."staff"', '"public"."address"', '"public"."store"' ]
                  ];
                generatorState.fromTables = fromTables;
                generatorState.tableLevelGraph.deserialize(serializedTableGraph);

                let result = queryGenerator.extractEligibleJoinPaths();
                expect(result).toEqual(expectedResult);
                expect(expectedEligibleJoinPath).toEqual(generatorState.eligibleJoinPath);
            });
        
        });

        describe('Test buildJoinClause', () => {
            let serializedTableGraph = { "nodes": [{ "id": "\"public\".\"staff\"" }, { "id": "\"public\".\"address\"" }, { "id": "\"public\".\"store\"" }], "links": [{ "source": "\"public\".\"staff\"", "target": "\"public\".\"address\"", "weight": 1, "info": "\"public\".\"staff\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"staff\"", "target": "\"public\".\"store\"", "weight": 1, "info": "\"public\".\"store\".\"manager_staff_id\" = \"public\".\"staff\".\"staff_id\"" }, { "source": "\"public\".\"address\"", "target": "\"public\".\"staff\"", "weight": 1, "info": "\"public\".\"staff\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"address\"", "target": "\"public\".\"store\"", "weight": 1, "info": "\"public\".\"store\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"store\"", "target": "\"public\".\"address\"", "weight": 1, "info": "\"public\".\"store\".\"address_id\" = \"public\".\"address\".\"address_id\"" }, { "source": "\"public\".\"store\"", "target": "\"public\".\"staff\"", "weight": 1, "info": "\"public\".\"store\".\"manager_staff_id\" = \"public\".\"staff\".\"staff_id\"" }] };

            let mockedGetValueFromDbMap;

            beforeEach(() => {
                mockedGetValueFromDbMap = AbstractQueryGenerator.prototype.getValueFromDbMap = jest.fn();
            });

            it('build a join clause', () => {
                let expectedResult = 'WHERE "public"."store"."manager_staff_id" = "public"."staff"."staff_id"';
                generatorState.projectionFilterItems = [];
                generatorState.tableLevelGraph.deserialize(serializedTableGraph);
                generatorState.shortJoinPaths = [["\"public\".\"store\"","\"public\".\"staff\""],["\"public\".\"staff\"","\"public\".\"store\""]];


                mockedGetValueFromDbMap.mockReturnValueOnce('WHERE');
                mockedGetValueFromDbMap.mockReturnValueOnce('AND');

                let result = queryGenerator.buildJoinClause('IRON MAN DB');
                expect(result).toEqual(expectedResult);
                expect(generatorState.joinClause).toEqual("WHERE \"public\".\"store\".\"manager_staff_id\" = \"public\".\"staff\".\"staff_id\"");

            });

            it('build a join clause with projections', () => {
                let expectedResult = 'WHERE "public"."store"."manager_staff_id" = "public"."staff"."staff_id" AND projection_item_1';
                generatorState.projectionFilterItems = ['projection_item_1'];
                generatorState.tableLevelGraph.deserialize(serializedTableGraph);
                generatorState.shortJoinPaths = [["\"public\".\"store\"","\"public\".\"staff\""],["\"public\".\"staff\"","\"public\".\"store\""]];


                mockedGetValueFromDbMap.mockReturnValueOnce('WHERE');
                mockedGetValueFromDbMap.mockReturnValueOnce('AND');

                let result = queryGenerator.buildJoinClause('IRON MAN DB');
                expect(result).toEqual(expectedResult);
                expect(generatorState.joinClause).toEqual('WHERE \"public\".\"store\".\"manager_staff_id\" = \"public\".\"staff\".\"staff_id\" AND projection_item_1');
            });
        
        
        });


        describe('Test handleProjectionItemSort', () => {

            let mockedGetValueFromDbMapByFieldName;
            beforeEach(() => {
                mockedGetValueFromDbMapByFieldName = AbstractQueryGenerator.prototype.getValueFromDbMapByFieldName = jest.fn();
            });

            it('Default Sort', () => {
                let expectedResult = ["order_by_item1", "order_by_item2","order_by_item3", "item1"];
                let projectionItemSortType = 'Default';
                let processedProjectionItem = 'item1';

                queryGenerator.handleProjectionItemSort(projectionItemSortType, {}, {}, 'IRON MAN DB', processedProjectionItem);
                expect(generatorState.orderByItems).toEqual(expectedResult);
            });

            it('Custom Sort', () => {
                let expectedResult = ["order_by_item1", "order_by_item2","order_by_item3", "itemABCDEF ASC "];
                let projectionItemSortType = 'ASC';
                let processedProjectionItem = 'itemABCDEF';

                mockedGetValueFromDbMapByFieldName.mockReturnValueOnce('ASC');

                queryGenerator.handleProjectionItemSort('ABC', {}, {}, 'IRON MAN DB', processedProjectionItem);
                expect(generatorState.orderByItems).toEqual(expectedResult);
            });
        
        });


        describe('Test prepareHavingItems', () => {
            let mockedGetValueFromDbMapByFieldName;
            let mockedFormatProjectionNameInDataSource;
            let mockedGetModelItemById;

            beforeEach(() => {
                generatorState.havingItems = [];
                mockedGetValueFromDbMapByFieldName = AbstractQueryGenerator.prototype.getValueFromDbMapByFieldName = jest.fn();
                mockedFormatProjectionNameInDataSource = AbstractQueryGenerator.prototype.formatProjectionNameInDataSource = jest.fn();
                mockedGetModelItemById = AbstractQueryGenerator.prototype.getModelItemById = jest.fn();
            });

            it('IN OPERATOR without aggregation', () => {
                let expectedResult = [ `"public"."staff"."last_name" IN ('Mike', 'Jon')` ];
                generatorState.queryDefinition.filters = [{"rightSideId":"a9e1b30e-d603-44db-8fa3-ea2a424846fa","operator":"IN_OPERATOR","leftSide":["Mike","Jon"]}];  
                mockedFormatProjectionNameInDataSource.mockReturnValueOnce('"public"."staff"."last_name"');
                mockedGetValueFromDbMapByFieldName.mockReturnValueOnce('IN');
                mockedGetModelItemById.mockReturnValueOnce('');
                queryGenerator.prepareHavingItems('Iron man Db');
                expect(generatorState.havingItems).toEqual(expectedResult);

            });

            it('IN OPERATOR with None aggregation', () => {
                let expectedResult = [ `"public"."staff"."last_name" IN ('Mike', 'Jon')` ];
                generatorState.queryDefinition.filters = [{"rightSideId":"a9e1b30e-d603-44db-8fa3-ea2a424846fa","operator":"IN_OPERATOR","leftSide":["Mike","Jon"], "aggregation": "None"}];  
                mockedFormatProjectionNameInDataSource.mockReturnValueOnce('"public"."staff"."last_name"');
                mockedGetValueFromDbMapByFieldName.mockReturnValueOnce('IN');
                mockedGetModelItemById.mockReturnValueOnce('');
                queryGenerator.prepareHavingItems('Iron man Db');
                expect(generatorState.havingItems).toEqual(expectedResult);

            });

            it('More than OPERATOR with aggregation', () => {
                let expectedResult = [ "COUNT(\"public\".\"staff\".\"last_name\") >= 'Mike'"];
                generatorState.queryDefinition.filters = [{"rightSideId":"a9e1b30e-d603-44db-8fa3-ea2a424846fa","operator":"MORE_THAN","leftSide":["Mike","Jon"], "aggregation":"COUNT"}];  
                
                mockedGetValueFromDbMapByFieldName.mockReturnValueOnce('COUNT');
                mockedFormatProjectionNameInDataSource.mockReturnValueOnce('"public"."staff"."last_name"');
                mockedGetValueFromDbMapByFieldName.mockReturnValueOnce('>=');
                mockedGetModelItemById.mockReturnValueOnce('');
                queryGenerator.prepareHavingItems('Iron man Db');
                expect(generatorState.havingItems).toEqual(expectedResult);

            });
        });


        describe('Test Utilities ', () => {

            it ('getConnection', () => {
                let model = {
                    dataSourceConnectionId: "BestModelEver"
                };

                let connections = [
                    {id: '123'},
                    {id: 'BestModelEver'}
                ];

                let result = queryGenerator.getConnection(model, connections);
                expect(result).toEqual(connections[1]);
            });

            it ('getConnection not found', () => {
                let model = {
                    dataSourceConnectionId: "BestModelEver"
                };

                let connections = [
                    {id: '123'},
                    {id: '124'}
                ];

                let result = queryGenerator.getConnection(model, connections);
                expect(result).toEqual(null);
            });
        });


    });
});
