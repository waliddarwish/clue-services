import { DatasetFileTable } from "../../../object-schema/src/schemas/catalog.dataset-datafile";


export class WorksheetTableState {
    theTable : any;
    tableName = '';
    tableDisplayName = '';
    tableIndex = 0;
    startColumn = '';
    startRow = 0;
    endColumn = '';
    endRow = 0;
    startCell = 0;
    endCell = 0;
    noOfRows = 0;
    noOfColumns = 0;
    sampleLinesLength = 0;
    columnInfoMap : any;
    csvFid: any;
    sheetIndex =0;
    sheetName = ''; 

    tableRecord: DatasetFileTable;
    validColumns = [];
    emptyColumns = [];
    validRows = [];

}