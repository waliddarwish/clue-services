


export class WorksheetState {
    rowCount = 0;
    actualRowCount = 0;
    columnCount = 0;
    actualColumnCount = 0;
    tables: any[] = [];
    sheetIndex = 0;
    firstRowNumber = 0;
    lastRowNumber = 0;
    validColumns = [];
    emptyColumns = [];
    startCell = '';
    endCell = '';
    tableName = 'table1';
    diplayName = 'table1';
    validRowIndexes = [];
    isValidSheet = false;
}