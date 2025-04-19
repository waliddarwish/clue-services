import { ApiProperty } from "@nestjs/swagger";

export class MetadataImportTaskTrackerObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    trackingId: string;
    @ApiProperty()
    clueModelId: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    startTimestamp: number;
    @ApiProperty()
    schemata: string;
    @ApiProperty()
    objectName: string;
    @ApiProperty()
    dataSourceConnectionId: string;
    @ApiProperty()
    importTimestamp: number;
    @ApiProperty()
    status: string;
    @ApiProperty()
    errorMessage: string;
}
