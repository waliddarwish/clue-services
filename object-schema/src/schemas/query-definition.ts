/**
 * 1. Query id is a hash of a sentized query string. 
 * 2. ID is a sequence generated 
 * 3. Model Loader (Orchestrator responsibility) then passed to the sql executor along with the query definition. 
 * 
 */

import { ApiProperty } from "@nestjs/swagger";


class LocalFilter {
    @ApiProperty()
    operator: string;
    @ApiProperty()
    leftSide: string;
}
class Projection {
    @ApiProperty()
    id: string;
    @ApiProperty()
    modelObjectItemId: string;
    @ApiProperty()
    aggregation: string; // if null then use the model.aggregation. count, 
    @ApiProperty()
    sortType: string; //asc, desc, default
    @ApiProperty({ type : [LocalFilter]})
    filters: LocalFilter[]
}

class GlobalFilter {
    @ApiProperty()
    rightSideId: string;
    @ApiProperty()
    aggregation: string;
    @ApiProperty()
    operator: string;
    @ApiProperty({ type : [String]})
    leftSide: string[]; // Take first item by default. Loop over operator IN. Ignore for is null and is not null. 
}
export class QueryDefinition {
    @ApiProperty()
    id: string;
    @ApiProperty()
    rowLimit: number; // default 100K 
    @ApiProperty()
    ignoreCache: boolean;
    @ApiProperty()
    selectDistinct: boolean;
    @ApiProperty()
    generateQueryOnly: boolean;
    @ApiProperty({ type : [Projection]})
    projections: Projection[];
    @ApiProperty({ type : [GlobalFilter]})
    filters: GlobalFilter[]
}