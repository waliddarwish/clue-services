import { ApiProperty } from "@nestjs/swagger";
import { DatasetDataFileObject } from "./catalog.dataset-datafile";

export class DatasetObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    datasetName: string;
    @ApiProperty()
    datasetDescription: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    tenantId: string;
    @ApiProperty()
    skeletonModelId: string;
    @ApiProperty({ type : [DatasetDataFileObject]})
    dataFiles: DatasetDataFileObject[];
    @ApiProperty()
    lastAccess: number;
    @ApiProperty()
    creationDate: number;


}