import { ApiProperty } from "@nestjs/swagger";
import { Optional } from "@nestjs/common";

export class DataFileColumn {
    @ApiProperty()
    id: string;
    @ApiProperty()
    modelObjectItemId: string;
    @ApiProperty()
    electedHeaderName: string;
    @ApiProperty()
    electedType: string;
    @ApiProperty()
    columnIndex: number;
    @ApiProperty()
    columnPrettyName: string;
}

export class DatasetFileTable {
    @ApiProperty()
    id: string;
    @ApiProperty()
    tableName: string;
    @ApiProperty()
    prettyName: string;
    @ApiProperty()
    fileName: string;
    @ApiProperty()
    fid: string;
    @ApiProperty()
    volumeId: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    errorMessage: string;
    @ApiProperty()
    dfsUrl: string;
    @ApiProperty()
    dfsPublicUrl: string;
    @ApiProperty()
    fileExtension: string;
    @ApiProperty()
    skipHeader: boolean;
    @ApiProperty()
    sampleSize: number;
    @ApiProperty()
    numberOfLines: number;
    @ApiProperty()
    electedDelimiter: string;
    @ApiProperty()
    strictQuote: string;
    @ApiProperty()
    electedTableName: string;
    @ApiProperty()
    datafileModelObjectId: string;
    @ApiProperty()
    analyzerStatus: string;
    @ApiProperty()
    jobId: string;
    @ApiProperty()
    modelObjectId: string;
    @ApiProperty()
    dfsFileStatus: string;
    @ApiProperty()
    fileSize: number;
    @ApiProperty()
    fileSizeInDFS: number;
    @ApiProperty()
    creationDate: number;
    @ApiProperty()
    importError: string;
    @ApiProperty({ type: [DataFileColumn] })
    tableColumns: DataFileColumn[];
};
export class DatasetDataFileObject {
    @ApiProperty()
    id: string;
    @ApiProperty()
    datasetId: string;
    @ApiProperty()
    fileName: string;
    @ApiProperty()
    fileType: string;
    @ApiProperty()
    fid: string;
    @ApiProperty()
    volumeId: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    analyzerStatus: string;
    @ApiProperty()
    dfsUrl: string;
    @ApiProperty()
    dfsPublicUrl: string;
    @ApiProperty()
    fileExtension: string;
    @ApiProperty()
    dfsFileStatus: string;
    @ApiProperty()
    fileSize: number;
    @ApiProperty()
    fileSizeInDFS: number;
    @ApiProperty()
    creationDate: number;
    @ApiProperty({ type: [DatasetFileTable] })
    tables: DatasetFileTable[];
    @ApiProperty()
    errorMessage: string;
}


