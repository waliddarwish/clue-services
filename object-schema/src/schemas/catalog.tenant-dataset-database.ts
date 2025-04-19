import { ApiProperty } from "@nestjs/swagger";

export class TenantDatasetDatabaseObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    tenantCert: string;
    @ApiProperty()
    tenantKey: string;
    @ApiProperty()
    tenantDatabaseName: string;
}