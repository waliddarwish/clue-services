import { ClueModelObject } from '../../../database-module/src/database.schemas';
import { DataSourceConnectionObject } from '../../../object-schema/src/schemas/catalog.connection';
import { DBFields } from './generator-constants';
import { GeneratorState } from './generator-state';
import { QueryDefinition } from '../../../object-schema/src/schemas/query-definition';
import constants = require('./generator-constants');
import Graph from 'graph-data-structure';
import dbMap = require('./generator-map.json');
import uuidValidator from 'uuid-validate';


const CommaSeparator = ',';
const DotSeparator = '.';
const SpaceSeparator = ' ';
const OpenBracket = '(';
const CloseBracket = ')';
const EqualSign = '=';


export abstract class AbstractQueryGenerator {
    generatorState: GeneratorState;
    constructor(theGeneratorState: GeneratorState) {
        this.generatorState = theGeneratorState;
    }

    protected abstract getDbName(): string;
    protected abstract buildQueryLimitsInternal();

    validateInput() {
        // We need to validate the input here. 
        console.log("Query-Generator: Base for : " + this.getDbName() + ": valdiating input");
        // Check if no projection items then return error 
        // projection id is manadatory. 
    }
    buildSelectClause() {
        //1: SELECT
        this.generatorState.selectClause = 'SELECT' + SpaceSeparator;
        if (!this.generatorState.queryDefinition.selectDistinct && this.generatorState.queryDefinition.selectDistinct === true) {
            this.generatorState.selectClause += this.getValueFromDbMap(DBFields.Distinct, this.getDbName()) + SpaceSeparator;
        }

        for (let i = 0; i < this.generatorState.queryDefinition.projections.length; i++) {
            const theModel = this.getModelById(this.generatorState.queryDefinition.projections[i].modelObjectItemId, this.generatorState.models);
            const theModelItem = this.getModelItemById(this.generatorState.queryDefinition.projections[i].modelObjectItemId, this.generatorState.models);
            const processedProjectionItem = this.handleProjectItem(this.generatorState.queryDefinition.projections[i].aggregation, this.generatorState.queryDefinition.projections[i].sortType, theModelItem, theModel, this.getDbName(), this.generatorState.queryDefinition.projections[i].id);
            this.handleProjectionItemFilters(this.generatorState.queryDefinition.projections[i].filters, theModelItem, this.getDbName());
            this.handleProjectionItemSort(this.generatorState.queryDefinition.projections[i].sortType, theModelItem, theModel, this.getDbName(), processedProjectionItem);

        }
        this.generatorState.selectClause = this.generatorState.selectClause.substring(0, this.generatorState.selectClause.length - 2);

    }
    buildFromClause() {
        //2: From: 
        this.generatorState.fromClause = 'From' + SpaceSeparator;
        for (let i = 0; i < this.generatorState.fromTables.length; i++) {
            this.generatorState.fromClause += this.generatorState.fromTables[i];
            this.generatorState.fromClause += CommaSeparator;
            this.generatorState.fromClause += SpaceSeparator;
        }
        this.generatorState.fromClause = this.generatorState.fromClause.substring(0, this.generatorState.fromClause.length - 2);
        this.generatorState.fromClause += SpaceSeparator;

        //console.log("Query-Generator: Base for : " + this.getDbName() + ": from clause: " + this.generatorState.fromClause);
    }
    buildWhereClause() {
        //3: Where:
        this.getModelGraph();
        //console.log(this.getDbName() + "query generator: Join path graphs: " + JSON.stringify(this.generatorState.serialezedTableGraph));
        var eligiblePaths = this.extractEligibleJoinPaths();
        console.log(this.getDbName() + " query generator: eligible paths: " + JSON.stringify(eligiblePaths));
        this.buildJoinClause(this.getDbName());
        //console.log("Query-Generator: Base for : " + this.getDbName() + ": where clause: " + this.generatorState.joinClause);
    }
    buildGroupByClause() {
        //4: Group by
        if (this.generatorState.groupByItems.length !== 0) {
            this.generatorState.groupByClause = this.getValueFromDbMap(DBFields.GroupBy, this.getDbName());
            this.generatorState.groupByClause += SpaceSeparator;
            for (let i = 0; i < this.generatorState.groupByItems.length; i++) {
                this.generatorState.groupByClause += this.generatorState.groupByItems[i] + CommaSeparator + SpaceSeparator;
            }
            this.generatorState.groupByClause = this.generatorState.groupByClause.substr(0, this.generatorState.groupByClause.length - 2);
        }
        //console.log("Query-Generator: Base for : " + this.getDbName() + ": group by clause: " + this.generatorState.groupByClause);
    }
    buildHavingClause() {
        //5: Having
        this.prepareHavingItems(this.getDbName());
        if (this.generatorState.havingItems.length !== 0) {
            this.generatorState.havingClause = this.getValueFromDbMap(DBFields.HavingOperator, this.getDbName());
            this.generatorState.havingClause += SpaceSeparator;
            const havingSplitter = SpaceSeparator + this.getValueFromDbMap(DBFields.AndOperator, this.getDbName()) + SpaceSeparator;
            for (let i = 0; i < this.generatorState.havingItems.length; i++) {
                this.generatorState.havingClause += this.generatorState.havingItems[i];
                this.generatorState.havingClause += havingSplitter;
            }
            this.generatorState.havingClause = this.generatorState.havingClause.substring(0, this.generatorState.havingClause.length - havingSplitter.length);
        }
        //console.log("Query-Generator: Base for : " + this.getDbName() + ": having clause: " + this.generatorState.havingClause);
    }
    buildOrderByClause() {
        //6: Order by
        if (this.generatorState.orderByItems.length !== 0) {
            this.generatorState.orderByClause = this.getValueFromDbMap(DBFields.OrderBy, this.getDbName());
            this.generatorState.orderByClause += SpaceSeparator;
            for (let i = 0; i < this.generatorState.orderByItems.length; i++) {
                this.generatorState.orderByClause += this.generatorState.orderByItems[i] + CommaSeparator + SpaceSeparator;
            }
            this.generatorState.orderByClause = this.generatorState.orderByClause.substring(0, this.generatorState.orderByClause.length - 2);
        }
        //console.log("Query-Generator: Base for : " + this.getDbName() + ": order by clause: " + this.generatorState.orderByClause);
    }
    buildQueryLimits() {
        this.buildQueryLimitsInternal();
    }
    composeQuery() {
        this.generatorState.query = this.generatorState.selectClause +
            SpaceSeparator +
            this.generatorState.fromClause +
            SpaceSeparator +
            this.generatorState.joinClause +
            SpaceSeparator +
            this.generatorState.groupByClause +
            SpaceSeparator +
            this.generatorState.havingClause +
            SpaceSeparator +
            this.generatorState.orderByClause;
        //console.log("Query-Generator: Base for : " + this.getDbName() + ": Complete query clause: " + this.generatorState.groupByClause);
    }

    /**
     * 1. Generate select item according to the algorithm below. 
     * 2. add to FromTables if not already there. 
     * 3. Generate order by item if needed. 
     * 
     * Item select algorithm: 
     * 1. if projection aggregation is not null then lookup the db map and get the corrosponding aggregation 
     * function. Format is FUNC(name in datasource)
     * 2. if projection aggregation is None then add the field to the select clause and the the group by 
     * 3. if projection is null, then lookup modelObjectItem.usage
     * 4. if usage is dimention then  add the field to the select clause and the the group by 
     * 5. if usage is fact and modelOjectionItem.defaultAggregation is not Null or None then use the default aggregation
     * 6. if usage is fact and modelOjectionItem.defaultAggregation is None then add the field to the select clause and the the group by 
     * 
     * 
     * @param projectionItemAggregation Projection Item id from the querydefinition
     * @param modelObjectItem Model object item 
     * @param connectionType database connection Type
     * 
     *  
     */
    handleProjectItem(projectionItemAggregation: any, projectionItemSort: any, theModelItem: any, theModel: any, connectionType: string, projectionItemId: string): string {
        const modelObjectItemAggregation = theModelItem.defaultAggregation;
        const modelObjectItemUsage = theModelItem.usage;
        let selectClausePart = '';
        let selectClausePartWithoutAs = '';
        const projectionItemName = this.formatProjectionNameInDataSource(theModelItem.nameInDatasource);
        let selectAsPart = '';
        if (projectionItemId) {
            selectAsPart = ' ' + this.getValueFromDbMap(DBFields.ALIAS_AS, connectionType) + ' \"' + projectionItemId + '\"';
        }

        if (projectionItemAggregation) {
            if (projectionItemAggregation === "None" || !projectionItemAggregation) {
                selectClausePartWithoutAs = projectionItemName;
                selectClausePart = selectClausePartWithoutAs + selectAsPart;
                this.generatorState.groupByItems.push(projectionItemName);
            } else {
                selectClausePartWithoutAs = this.getValueFromDbMapByFieldName(projectionItemAggregation, connectionType) + OpenBracket + projectionItemName + CloseBracket;
                selectClausePart = selectClausePartWithoutAs + selectAsPart;
            }
        } else if (modelObjectItemUsage === "Fact") {
            if (modelObjectItemAggregation === "None" || !modelObjectItemAggregation) {
                selectClausePartWithoutAs = projectionItemName;
                selectClausePart = selectClausePartWithoutAs + selectAsPart;
                this.generatorState.groupByItems.push(projectionItemName);
            } else {
                selectClausePartWithoutAs = this.getValueFromDbMapByFieldName(modelObjectItemAggregation, connectionType) + OpenBracket + projectionItemName + CloseBracket;
                selectClausePart = selectClausePartWithoutAs + selectAsPart;
            }
        } else if (modelObjectItemUsage === "Dimension") {
            selectClausePartWithoutAs = projectionItemName;
            selectClausePart = selectClausePartWithoutAs + selectAsPart;
            this.generatorState.groupByItems.push(projectionItemName);
        }

        this.generatorState.selectClause += selectClausePart + CommaSeparator + SpaceSeparator;



        // If theModel is null then throw an error ??
        if (this.generatorState.fromTables.indexOf(this.formatProjectionNameInDataSource(theModel.nameInDatasource)) == -1) {
            this.generatorState.fromTables.push(this.formatProjectionNameInDataSource(theModel.nameInDatasource));
        }

        return selectClausePartWithoutAs;
    }

    /**
     * handleProjectionItemFilters would loop over project item filters to generate the appropriate where condition 
     * expected format: projection item name in data source, operator, right side
     * right side can be lateral or another projection item. if its a projection item then we need to retrieve its name from the state models.  
     * @param filters Filters list (operator, left side)
     * @param theModelItem projection model item. the right side
     */
    handleProjectionItemFilters(filters: any[], theModelItem: any, connectionType: string) {
        if (filters) {
            for (let i = 0; i < filters.length; i++) {
                var whereCondition = this.formatProjectionNameInDataSource(theModelItem.nameInDatasource);
                whereCondition += " ";
                whereCondition += this.getValueFromDbMapByFieldName(filters[i].operator, connectionType);
                whereCondition += " ";
                if (filters[i].leftSide) {
                    if (uuidValidator(filters[i].leftSide)) {
                        var leftSideModelObjectItem = this.getModelItemById(filters[i].leftSide, this.generatorState.models);
                        var leftSideModelObject = this.getModelById(filters[i].leftSide, this.generatorState.models);
                        whereCondition += this.formatProjectionNameInDataSource(leftSideModelObjectItem.nameInDatasource);
                        // If theModel is null then throw an error ??
                        if (this.generatorState.fromTables.indexOf(this.formatProjectionNameInDataSource(leftSideModelObject.nameInDatasource)) == -1) {
                            this.generatorState.fromTables.push(this.formatProjectionNameInDataSource(leftSideModelObject.nameInDatasource));
                        }
                    } else {
                        whereCondition += "'" + filters[i].leftSide + "'";
                    }
                }
                this.generatorState.projectionFilterItems.push(whereCondition);
            }
        }
    }
    /**
     * Build a graph for the model objects. This graph can then be traversed to find the join path 
     * between db objects. 
     * 1. loop over the model objects (tables)
     * 2. loop over the model object items (columns)
     * 3. if the model object item is primary key then find all foriegn keys for it and add edge nodes to the graph in format addEdge(a,b) 
     *  where a is the table with pk and b is the table with fk. 
     * 
     * 
     * Think about adding db connection type to the model object to make my life easier 
     * Thank about if the model object item is FK, do we need to do the reverse travers ?
     * Think about how DB is repersenting constraint names and weather to handle the difference in the query generator or at the model importer 
     * @param models 
     * @param connections 
     */
    getModelGraph() {
        var models: ClueModelObject[] = this.generatorState.models;
        //var connections: DataSourceConnectionObject[] = this.generatorState.connections;

        for (let i = 0; i < models.length; i++) {
            //const connection = this.getConnection(models[i], connections)
            const pkName = this.getValueFromDbMap(DBFields.PrimaryKey, this.generatorState.connectionName);
            //console.log("Query-Generator: getModelGraph: Inspecting: ")
            for (let j = 0; j < models[i].modelObjectItems.length; j++) {
                if (models[i].modelObjectItems[j].isForeignKey) { // source is the FK, target is the PK
                    const targetTableNode = this.formatProjectionNameInDataSource(models[i].modelObjectItems[j].sourceSchema + DotSeparator + models[i].modelObjectItems[j].sourceTable);
                    const sourceTableNode = this.formatProjectionNameInDataSource(models[i].modelObjectItems[j].foreignTableSchema + DotSeparator + models[i].modelObjectItems[j].foreignTableName);
                    const targetColumnNode = this.formatProjectionNameInDataSource(models[i].modelObjectItems[j].foreignTableSchema + DotSeparator + models[i].modelObjectItems[j].foreignTableName + DotSeparator +
                        models[i].modelObjectItems[j].foreignTableColumnName); // public.address.address_id
                    const sourceColumnNode = this.formatProjectionNameInDataSource(models[i].modelObjectItems[j].nameInDatasource); ///public.store.address_id
                    const joinCondition = sourceColumnNode + SpaceSeparator + EqualSign + SpaceSeparator + targetColumnNode;
                    //console.log("Query-Generator: getModelGraph: Inspecting: " + models[i].modelObjectItems[j].nameInDatasource + " source table node: " + sourceTableNode + " target table node: " + targetTableNode);
                    this.generatorState.tableLevelGraph.addEdge(sourceTableNode, targetTableNode, undefined, joinCondition);

                    this.generatorState.tableLevelGraph.addEdge(targetTableNode, sourceTableNode, undefined, joinCondition); // add node in the other direction


                    this.generatorState.columnLevelGraph.addEdge(sourceColumnNode, targetColumnNode);
                    this.generatorState.columnLevelGraph.addEdge(targetColumnNode, sourceColumnNode);
                } else if (models[i].modelObjectItems[j].isPrimaryKey) {
                    //console.log("Query-Generator: getModelGraph: Inspecting: " + models[i].modelObjectItems[j].nameInDatasource + " is PK");
                    this.generatorState.tableLevelGraph.addNode(this.formatProjectionNameInDataSource(models[i].nameInDatasource));
                    this.generatorState.columnLevelGraph.addNode(this.formatProjectionNameInDataSource(models[i].modelObjectItems[j].nameInDatasource));
                }

            }
        }

        //console.log("Query-Generator: getModelGraph: Table graph: " + JSON.stringify(tableLevelGraph));
        //console.log("Query-Generator: getModelGraph: Table graph nodes: " + this.generatorState.tableLevelGraph.nodes());
        //console.log("Query-Generator: getModelGraph: Table graph serialize: " + JSON.stringify(this.generatorState.tableLevelGraph.serialize()));
        this.generatorState.serialezedTableGraph = this.generatorState.tableLevelGraph.serialize();
        this.generatorState.serializedColumnGraph = this.generatorState.columnLevelGraph.serialize();
        this.generatorState.result = 0;
        this.generatorState.resultMessage = "Success";
    }

    /**
     * 1. construct the graph in form of (FK, PK)
    2.  for each of the tables in the from clause, use the depthFirstSearch to return a list of nodes visited (call it nodeDFS)
    3. If nodeDFS contain all tables from the from clause then we will extract the mandatory nodes and add them to an eligible paths list
    4. Inspect the eligible path list and choose the shortest path that contains all the required nodes. 

     * 
     * @param fromTables 
     * @param models 
     * @param tableLevelGraph 
     * @param columnLevelGraph 
     */
    extractEligibleJoinPaths(): any[] {
        /**
         * 1. Loop over the tables one by one. Table format is schema.tablename
         * 2. for each table, query the graph and extract DFS and add it to tableDFSPath
         * 3. For each of the tableDFSNodes, check if the path is eligible or not. eligible path contains all the tables 
         *    in from array. 
         * 4. For each eligible join path, extract the join path route. 
         * 5. extract the shortest route from each join path 
         * TABle a, b
         * 
         * a, b, c
         * 
         * a, d, c,b, m, n [a, d, c, b]
         * 
         * b, d, f, z, a, c [ b, d, f, z, a, c]
         * G, z
         */
        console.log("\n\nQuery generator: extractEligibleJoinPaths: starting");
        //console.log("Query generator: extractEligibleJoinPaths: tableGraphInput" + this.generatorState.serialezedTableGraph);

        //console.log("Query generator: extractEligibleJoinPaths: tableGraph: " + JSON.stringify(this.generatorState.tableLevelGraph.serialize()));

        for (let i = 0; i < this.generatorState.fromTables.length; i++) {
            this.generatorState.tableDFSNodes.push(this.generatorState.tableLevelGraph.depthFirstSearch([this.generatorState.fromTables[i]], true));
        }
        for (let i = 0; i < this.generatorState.tableDFSNodes.length; i++) {
            console.log("Query generator: extractEligibleJoinPaths: tableDFSNodes[" + i + "] : Values: " + JSON.stringify(this.generatorState.tableDFSNodes[i]));
        }
        for (let i = 0; i < this.generatorState.tableDFSNodes.length; i++) {

            var missingNode: boolean;
            missingNode = false;
            for (let j = 0; j < this.generatorState.fromTables.length; j++) {
                if (this.generatorState.tableDFSNodes[i].indexOf(this.generatorState.fromTables[j]) === -1) {
                    missingNode = true;
                    console.log("table DFS [" + JSON.stringify(this.generatorState.tableDFSNodes[i]) + "] is not an eligible join path because its missing node: [" + this.generatorState.fromTables[j] + "]")
                    break;
                }
            }
            if (!missingNode) {
                console.log("table DFS [" + JSON.stringify(this.generatorState.tableDFSNodes[i]) + "] is eligible for join path!");
            }
            this.generatorState.eligibleJoinPath.push(this.generatorState.tableDFSNodes[i]);
        }

        console.log("Found " + this.generatorState.eligibleJoinPath.length + " join paths!");


        for (let i = 0; i < this.generatorState.eligibleJoinPath.length; i++) {
            var shortJoinPath: any[] = [];
            const fromTableCopy = this.generatorState.fromTables;
            for (let j = 0; j < this.generatorState.eligibleJoinPath[i].length; j++) {
                if (this.generatorState.fromTables.length === 0) {
                    console.log("Query generator: extractEligibleJoinPaths: Determine shortest path: No more From tables");
                    break;
                }
                console.log("Query generator: extractEligibleJoinPaths: searching for [" + this.generatorState.eligibleJoinPath[i][j] + "] in table list: " + JSON.stringify(fromTableCopy));
                const index: number = fromTableCopy.indexOf(this.generatorState.eligibleJoinPath[i][j]);

                if (index == -1) {
                    console.log("Query generator: extractEligibleJoinPaths:  Node [" + this.generatorState.eligibleJoinPath[i][j] + "] is not required");
                    //fromTableCopy.splice(index, 1);
                } else {
                    console.log("Query generator: extractEligibleJoinPaths:  Node [" + this.generatorState.eligibleJoinPath[i][j] + "] is required. Adding to shortest path list");
                    shortJoinPath.push(this.generatorState.eligibleJoinPath[i][j]);
                }
            }
            // Validate short path where for path of node (a,b,c) a must be connected to b and b must be connected to C. 
            var validPath = true;
            for (let i = 0; i < (shortJoinPath.length - 1); i++) {
                var nodeInfo = this.generatorState.tableLevelGraph.getEdgeInfo(shortJoinPath[i], shortJoinPath[i + 1]);
                if (!nodeInfo) {
                    console.log("Query generator: extractEligibleJoinPaths: path [" + JSON.stringify(shortJoinPath) + "]  is not valid because node [" + shortJoinPath[i] +
                        "] and node[" + shortJoinPath[i + 1] + "] are not connected");
                    validPath = false;
                }
            }
            if (validPath) {
                console.log("Query generator: extractEligibleJoinPaths: adding path [" + shortJoinPath + "] to the short path list");
                this.generatorState.shortJoinPaths.push(shortJoinPath);
            }

        }

        return this.generatorState.shortJoinPaths;

    }

    /**
     * buildJoinClause: 
     * 1. inspect the shortestJoinPaths list generated by the extractElgiblePath
     * 2. choose the shortest path
     * 3. Loop over the shortest path and build join query using nodeInfo
     * 4. Loop over the projectionFilterItems generated by handleProjectionItemFilters and add then to the join query
     * @param connectionType 
     */
    buildJoinClause(connectionType: string): any {

        for (let i = 0; i < this.generatorState.shortJoinPaths.length; i++) {
            if (!this.generatorState.shortestPath || this.generatorState.shortestPath.length == 0) {
                this.generatorState.shortestPath = this.generatorState.shortJoinPaths[i];
            } else if (this.generatorState.shortestPath.length < this.generatorState.shortJoinPaths[i].length) {
                console.log("Current shortest path [" + JSON.stringify(this.generatorState.shortestPath) + "] is shorter than [" + JSON.stringify(this.generatorState.shortJoinPaths[i] + "]"));
            } else if (this.generatorState.shortestPath.length > this.generatorState.shortJoinPaths[i].length) {
                console.log("Current shortest path [" + JSON.stringify(this.generatorState.shortestPath) + "] is longer than [" + JSON.stringify(this.generatorState.shortJoinPaths[i] + "]. swapping"));
                this.generatorState.shortestPath = this.generatorState.shortJoinPaths[i];
            } else if (this.generatorState.shortestPath.length == this.generatorState.shortJoinPaths[i].length) {
                console.log("Current shortest path [" + JSON.stringify(this.generatorState.shortestPath) + "] is equal to [" + JSON.stringify(this.generatorState.shortJoinPaths[i] + "]. What do we do???"));
            }

        }

        console.log("Shortest path: " + JSON.stringify(this.generatorState.shortestPath));
        let joinRequired = false;
        var joinClause = this.getValueFromDbMap(DBFields.WhereOperator, connectionType);
        joinClause += SpaceSeparator;
        var joinSplitter = SpaceSeparator + this.getValueFromDbMap(DBFields.AndOperator, connectionType) + SpaceSeparator;
        for (let i = 0; i < (this.generatorState.shortestPath.length - 1); i++) {
            var nodeInfo = this.generatorState.tableLevelGraph.getEdgeInfo(this.generatorState.shortestPath[i], this.generatorState.shortestPath[i + 1]);
            joinClause += nodeInfo;
            joinClause += joinSplitter;
            joinRequired = true;
        }

        for (let i = 0; i < this.generatorState.projectionFilterItems.length; i++) {
            joinClause += this.generatorState.projectionFilterItems[i];
            joinClause += joinSplitter;
            joinRequired = true;
        }
        if (joinRequired) {
            joinClause = joinClause.substring(0, joinClause.length - joinSplitter.length);
            this.generatorState.joinClause = joinClause;
        } else {
            this.generatorState.joinClause = '';
        }
        return joinClause;
    }

    // TODO add default sort type: If the query definition has no sort type then try to retrieve it from the model object item 
    handleProjectionItemSort(projectionItemSortType: any, theModelItem: any, theModel: any, connectionType: string, processedProjectionItem: string) {

        if (projectionItemSortType) {
            var sortBy = "";
            sortBy += processedProjectionItem;
            if (projectionItemSortType !== 'Default') {
                sortBy += SpaceSeparator;
                sortBy += this.getValueFromDbMapByFieldName(projectionItemSortType, connectionType);
                sortBy += SpaceSeparator;
            }

            this.generatorState.orderByItems.push(sortBy);
        }
    }


    /**
     * Prepare the having items in the following format: 
     * rightsideItem Operator leftside
     * 1. Check filter aggregation and use it if provided 
     * Right side item follow the same roles as the select statement. 
     * @param dbName 
     */
    prepareHavingItems(connectionType: string) {
        if (this.generatorState.queryDefinition.filters) {
            for (let i = 0; i < this.generatorState.queryDefinition.filters.length; i++) {
                var havingItem = "";
                if (this.generatorState.queryDefinition.filters[i].aggregation && this.generatorState.queryDefinition.filters[i].aggregation != "None") {
                    havingItem += this.getValueFromDbMapByFieldName(this.generatorState.queryDefinition.filters[i].aggregation, connectionType);
                    havingItem += OpenBracket;
                    havingItem += this.formatProjectionNameInDataSource(this.getModelItemById(this.generatorState.queryDefinition.filters[i].rightSideId, this.generatorState.models).nameInDatasource);
                    havingItem += CloseBracket;
                } else {
                    havingItem += this.formatProjectionNameInDataSource(this.getModelItemById(this.generatorState.queryDefinition.filters[i].rightSideId, this.generatorState.models).nameInDatasource);
                }

                const havingOperator = this.getValueFromDbMapByFieldName(this.generatorState.queryDefinition.filters[i].operator, connectionType);
                havingItem += SpaceSeparator;
                havingItem += havingOperator;
                havingItem += SpaceSeparator;

                if (this.generatorState.queryDefinition.filters[i].operator === DBFields.InOperator || this.generatorState.queryDefinition.filters[i].operator === DBFields.InOperator) {
                    var leftSide = OpenBracket;
                    for (let j = 0; j < this.generatorState.queryDefinition.filters[i].leftSide.length; j++) {
                        leftSide += "'" + this.generatorState.queryDefinition.filters[i].leftSide[j] + "'";
                        leftSide += CommaSeparator + SpaceSeparator;
                    }
                    leftSide = leftSide.substring(0, leftSide.length - 2);
                    leftSide += CloseBracket;
                    havingItem += leftSide;
                } else {
                    havingItem += "'" + this.generatorState.queryDefinition.filters[i].leftSide[0] + "'";
                }
                //console.log("prepareHavingItems: Adding having condtion: " + havingItem);
                this.generatorState.havingItems.push(havingItem);
            }
        }


    }


    getConnection(model: ClueModelObject, connections: DataSourceConnectionObject[]): DataSourceConnectionObject {
        for (let i = 0; i < connections.length; i++) {
            if (connections[i].id === model.dataSourceConnectionId) {
                return connections[i];
            }
        }
        return null;
    }


    getModelById(projectionItemId: string, models: ClueModelObject[]): ClueModelObject {
        //console.log("\ngetModelByProjectionItemId: projection item id: " + projectionItemId);
        //console.log("\ngetModelByProjectionItemId: models: " + JSON.stringify(models) + "\n\n");
        for (let i = 0; i < models.length; i++) {
            for (let j = 0; j < models[i].modelObjectItems.length; j++) {
                //console.log("getModelByProjectionItemId: inspecting item: " + JSON.stringify(models[i].modelObjectItems[j]));

                if (models[i] && models[i].modelObjectItems[j] && models[i].modelObjectItems[j].modelObjectItemId === projectionItemId) {
                    return models[i];
                } else if (!models[i] || !models[i].modelObjectItems[j]) {
                    console.log("Query-Generator Panic: Why is it null: i: [" + i + "] j: [" + j + "]");
                }
            }
        }
        console.log("Query-Generator Panic: project item id: " + projectionItemId + " not found in model array");
        return null;
    }

    getModelItemById(projectionItemId: string, models: ClueModelObject[]) {
        for (let i = 0; i < models.length; i++) {
            //console.log("\n ")
            for (let j = 0; j < models[i].modelObjectItems.length; j++) {
                if (models[i].modelObjectItems[j].modelObjectItemId === projectionItemId) {
                    return models[i].modelObjectItems[j];
                }
            }
        }
        console.log("Query-Generator Panic: project item id: " + projectionItemId + " not found in model array");
        return null;
    }

    getProjectionItemByModelObjectItemId(modelObjectItemId: string): any {
        for (let i = 0; i < this.generatorState.queryDefinition.projections.length; i++) {
            if (this.generatorState.queryDefinition.projections[i].modelObjectItemId === modelObjectItemId) {
                return this.generatorState.queryDefinition.projections[i];
            }
        }
    }


    getValueFromDbMap(field: DBFields, connectionType: string): any {
        let databaseConfig = dbMap[connectionType];
        return databaseConfig[field];
    }
    getValueFromDbMapByFieldName(fieldName: string, connectionType: string): any {
        let databaseConfig = dbMap[connectionType];
        return databaseConfig[fieldName.toUpperCase()];
    }
    formatProjectionNameInDataSource(projectionNameInDatasource: string): string {
        if (this.generatorState.wrapColumnNameInDoubleQuotes) {
            return "\"" + projectionNameInDatasource.replace(/\./g, '\"\.\"') + "\"";
        } else {
            return projectionNameInDatasource;
        }
    }

}