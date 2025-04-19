import { ApiProperty } from "@nestjs/swagger";


class JoinCondition {
    @ApiProperty()
    left: string;
    @ApiProperty()
    right: string;
}
class JoinPath {
    @ApiProperty()
    connectionId: string;
    @ApiProperty({ type : [JoinCondition] })
    joinConditions: JoinCondition[];
}
class ModelObjectItem {
    @ApiProperty()
    modelObjectItemId: string;
    @ApiProperty()
    nameInDatasource: string;
    @ApiProperty()
    columnName: string;
    @ApiProperty()
    prettyName: string;
    @ApiProperty()
    dataTypeInDataSource: string;
    @ApiProperty()
    sourceModelObjectId: string;
    @ApiProperty()
    sourceModelObjectItemId: string;
    @ApiProperty()
    dataLength: number;
    @ApiProperty()
    precisionInDataSource: number;
    @ApiProperty()
    decimalPoints: number;
    @ApiProperty()
    usage: string;
    @ApiProperty()
    usageType: string;
    @ApiProperty()
    defaultAggregation: string;
    @ApiProperty()
    defaultFormat: string;
    @ApiProperty()
    isPrimaryKey: boolean;
    @ApiProperty()
    isForeignKey: boolean;
    @ApiProperty()
    references: string;
    @ApiProperty()
    sourceSchema: string;
    @ApiProperty()
    sourceTable: string;
    @ApiProperty()
    foreignTableSchema: string;
    @ApiProperty()
    foreignTableName: string;
    @ApiProperty()
    foreignTableColumnName: string;
    @ApiProperty()
    constraintType: string;
    @ApiProperty()
    defaultSort: string;
}
export class ClueModelObjectEntry {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    nameInDatasource: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    dataSourceConnectionId: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    source: string;
    @ApiProperty()
    schemata: string;
    @ApiProperty()
    clueModelId: string;
    @ApiProperty()
    datasetDatafileId: string;
    @ApiProperty()
    tableId: string;
    @ApiProperty({ type : [ModelObjectItem]})
    modelObjectItems: ModelObjectItem[];
    @ApiProperty({ type : [JoinPath]})
    joinPath: JoinPath[];
    @ApiProperty({ type: [String]})
    filterExpression: string[];
}

