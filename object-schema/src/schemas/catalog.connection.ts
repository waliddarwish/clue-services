import { ApiProperty } from "@nestjs/swagger";

class ConnectionProperty {
    @ApiProperty()
    name: string;
    @ApiProperty()
    value: string;
}
class ConnectionInfo {
    @ApiProperty()
    serverName: string;
    @ApiProperty()
    serverPort: number;
    @ApiProperty()
    serviceName: string;
    @ApiProperty({ type : [ConnectionProperty]})
    connectionProperties: ConnectionProperty[];
    @ApiProperty()
    username: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    connectionTimeout: number;
}
export class DataSourceConnectionObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    metadataConnectionCount: number;
    @ApiProperty()
    dataConnectionCount: number;
    @ApiProperty()
    maxMetadataConnectionCount: number;
    @ApiProperty()
    maxDataConnectionCount: number;
    @ApiProperty()
    metadataConcurrency: number;
    @ApiProperty()
    dataConcurrency: number;
    @ApiProperty()
    maxAcquireConnectionRetry: number;
    @ApiProperty()
    acquireConnectionSleepDuration: number;
    @ApiProperty()
    connectionType: string;
    @ApiProperty()
    connectionInfo: ConnectionInfo;
    @ApiProperty()
    lastAccess: number;
    @ApiProperty()
    creationDate: number;

}

// export type UpdateDatasourceConnectionDTO = Omit<DataSourceConnectionObject, 'id'>;

export class DataSourceConnectionObjectDTO {
    @ApiProperty()
    name: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    metadataConnectionCount: number;
    @ApiProperty()
    dataConnectionCount: number;
    @ApiProperty()
    maxMetadataConnectionCount: number;
    @ApiProperty()
    maxDataConnectionCount: number;
    @ApiProperty()
    metadataConcurrency: number;
    @ApiProperty()
    dataConcurrency: number;
    @ApiProperty()
    maxAcquireConnectionRetry: number;
    @ApiProperty()
    acquireConnectionSleepDuration: number;
    @ApiProperty()
    connectionType: string;
    @ApiProperty()
    connectionInfo: ConnectionInfo;
    @ApiProperty()
    lastAccess: number;

}