
import { ApiProperty } from '@nestjs/swagger';

export class ClueSettings {
    @ApiProperty()
    id: string;
    @ApiProperty()
    datasetDatabaseCA: string;
    @ApiProperty()
    datasetDatabaseCACert: string;
    @ApiProperty()
    datasetDatabaseRootUserCert: string;
    @ApiProperty()
    datasetDatabaseRootUserKey: string;
    @ApiProperty()
    datasetDatabaseDSUserCert: string;
    @ApiProperty()
    datasetDatabaseDSUserKey: string;
    @ApiProperty()
    installationType: string;
    @ApiProperty()
    schemaMajorVersion: number;
    @ApiProperty()
    schemaMinorVersion: number;
    @ApiProperty()
    maxAcquireDatasetStoreConnectionRetry: number;
    @ApiProperty()
    acquireDatasetStoreConnectionSleepDuration: number;
}