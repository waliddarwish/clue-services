import { ApiProperty } from "@nestjs/swagger";

class Datasource { 
    @ApiProperty()
    datasourceType: string;
    @ApiProperty()
    datasourceId: string;
}
export class ClueModelEntry {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    modelType: string;
    @ApiProperty( { type : [Datasource] } )
    datasources: Datasource[];
    @ApiProperty()
    lastAccess: number;
    @ApiProperty()
    showJoinsOnGraph: boolean;
    @ApiProperty()
    hideGraph: boolean;
    @ApiProperty()
    hideDataPreview: boolean;
    @ApiProperty()
    hidePropertySheet: boolean;
    @ApiProperty()
    creationDate: number;

}


export class ClueModelEntryDTO {
    @ApiProperty()
    name: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    modelType: string;
    @ApiProperty( { type : [Datasource] } )
    datasources: Datasource[];
    @ApiProperty()
    lastAccess: number;
    @ApiProperty()
    showJoinsOnGraph: boolean;
    @ApiProperty()
    hideGraph: boolean;
    @ApiProperty()
    hideDataPreview: boolean;
    @ApiProperty()
    hidePropertySheet: boolean;
}

