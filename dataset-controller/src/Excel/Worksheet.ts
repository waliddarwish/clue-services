import { WorksheetState } from "./worksheet-state";
import {WorksheetTable} from './worksheet-table';
import { WorksheetTableState } from "./worksheet-table-state";
import { ClueDFSService } from "../../../clue-dfs-module/src/clue-dfs.service";
import { ExcelConstants } from "./Constants";
import { ExcelHelper } from "./helpers";
import e from "express";



export class Worksheet {
    state: WorksheetState;
    private dataFileProvider: any;
    private theDataFile: any;
    private excelHelper: ExcelHelper;

    constructor(private readonly clueDFSService: ClueDFSService, dataFileProvider: any, state: WorksheetState, theDataFile: any ) {
        this.state = state;
        this.dataFileProvider = dataFileProvider;
        this.theDataFile = theDataFile;
        this.excelHelper = new ExcelHelper();
    }
    /**
     * 1. loop over the rows and sample few rows. similar to the csv sampling 
     * 2. elect data types 
     * 3. Determine if the header is an actual header or part of the data. 
     * 4. create a new table based on the data types 
     * 5. loop over the rows and queue new job to insert the row in cockroach 
     * 6. Update catalog process info as we go
     * @param worksheet 
     * @param state 
     */

     /*
        const tableDef = this.state.theTable.table;
        this.state.tableName = tableDef.name;
        this.state.tableDisplayName = tableDef.displayName;
        const split = tableDef.tableRef.split(":");
     */
    async handleWorkSheet(worksheet: any): Promise<any> {
        //console.log(worksheet);
        this.state.rowCount = worksheet.rowCount;
        this.state.actualRowCount = worksheet.actualRowCount;
        this.state.columnCount = worksheet.columnCount;
        this.state.actualColumnCount = worksheet.actualColumnCount;
        
        this.state.tables = worksheet.getTables();
        let promiseArray = [];
        //If no tables deducted then the sheet is one big table
        if (this.state.tables.length === 0) {

            this.buildTableDefinitionFromSheet(worksheet);
            if (!this.state.isValidSheet ) {
                console.log('sheet is not valid');
            }
            console.log('Worksheet state: ' + JSON.stringify(this.state));
            let worksheetTableState = new WorksheetTableState();
            worksheetTableState.theTable = {
                table: {
                    name: this.state.tableName,
                    displayName: this.state.diplayName,
                    tableRef: this.state.startCell + ':' + this.state.endCell
                }
            };
            worksheetTableState.sheetIndex = this.state.sheetIndex;
            worksheetTableState.sheetName = worksheet.name;
            worksheetTableState.tableIndex = 0;
            worksheetTableState.validColumns = this.state.validColumns;
            worksheetTableState.emptyColumns = this.state.emptyColumns;
            worksheetTableState.validRows = this.state.validRowIndexes;
            promiseArray.push(new WorksheetTable(this.clueDFSService, this.dataFileProvider, worksheetTableState, this.theDataFile).handleTable(worksheet));


        } else {
            for (let i = 0; i < this.state.tables.length; i++) {
                let worksheetTableState = new WorksheetTableState();
                worksheetTableState.theTable = this.state.tables[i];
                worksheetTableState.sheetIndex = this.state.sheetIndex;
                worksheetTableState.sheetName = worksheet.name;
                worksheetTableState.tableIndex = i;
                promiseArray.push(new WorksheetTable(this.clueDFSService, this.dataFileProvider, worksheetTableState, this.theDataFile).handleTable(worksheet));
            }
        }

       


        
        return Promise.all(promiseArray).then((results) => {
            console.log('Worksheet results: ' + JSON.stringify(results));
            let failedTableCount = 0;
            for (const result of results) {
                if (result.status === ExcelConstants.RESULT_FAILED) {
                    failedTableCount++;
                }
            }
            if (failedTableCount === results.length) {
                return {status: ExcelConstants.RESULT_ALL_FAILED};
            } else if (failedTableCount > 0) {
                return {status: ExcelConstants.RESULT_FAILED};
            } else {
                return {status: ExcelConstants.RESULT_SUCCESS};
            }
            
        });
    }


    private buildTableDefinitionFromSheet(worksheet: any) {
        console.log('Worksheet: ' + worksheet.name + ' has no tables');


        const actualColumnCount = worksheet.actualColumnCount;
        const actualRowCount = worksheet.actualRowCount;

        console.log('buildTableDefinitionFromSheet actualColumnCount: ' + actualColumnCount);
        console.log('buildTableDefinitionFromSheet actualRowCount: ' + actualRowCount);

        let validRowsIndexes = [];

        // Iterate over all rows that have values in a worksheet
        worksheet.eachRow(function(row, rowNumber) {
            console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
            validRowsIndexes.push(rowNumber);
        });

        if (validRowsIndexes.length === 0) {
            return;
        }

        console.log('buildTableDefinitionFromSheet First row number: ' + validRowsIndexes[0]);
        console.log('buildTableDefinitionFromSheet Last row number: ' + validRowsIndexes[validRowsIndexes.length -1]);
        this.state.firstRowNumber = validRowsIndexes[0];
        this.state.lastRowNumber = validRowsIndexes[validRowsIndexes.length - 1];

        this.state.validRowIndexes = validRowsIndexes;

        // get non null columns that adds up to the actual column count
        let validColumnsCounter = 0;
        let validColumns = [];
        let emptyColumns = [];
        let columnIndex = 'A';
        let columnNumericIndex = 1;

        while(validColumnsCounter != actualColumnCount) {
           
            let cell = worksheet.findCell(validRowsIndexes[0], columnNumericIndex);
            console.log('Cell at: ' + validRowsIndexes[0] +':'+ columnNumericIndex + '['+columnIndex+']'  + ' val: ' + cell);
            if (cell ===  undefined || cell.value == null || cell.value == '') {
                if (this.isColumnReallyNull(columnNumericIndex, validRowsIndexes[0], worksheet, columnIndex)) {
                    emptyColumns.push(columnIndex);
                } else {
                    validColumns.push(columnIndex);
                    validColumnsCounter ++;
                }
            } else {
                validColumns.push(columnIndex);
                validColumnsCounter ++;
            }

            columnIndex = this.excelHelper.incrementString(columnIndex);
            columnNumericIndex++;
        }
        if (validColumns.length === 0) {
            console.log('Worksheet name: ' + worksheet.name + ' has no valid columns');
            this.state.isValidSheet = false;
            return null;
        }

        console.log('buildTableDefinitionFromSheet valid columns: ' + JSON.stringify(validColumns));

        console.log('buildTableDefinitionFromSheet empty columns: ' + JSON.stringify(emptyColumns));


        
        let startCell = validColumns[0] + '' + validRowsIndexes[0];
        let endCell = validColumns[validColumns.length -1 ] + '' + validRowsIndexes[validRowsIndexes.length -1];


        this.state.validColumns = validColumns;
        this.state.emptyColumns = emptyColumns;
        this.state.startCell = startCell;
        this.state.endCell = endCell;

        this.state.isValidSheet = true;
    }

    private isColumnReallyNull(columnNumericIndex: number, firstRowNumber: number, worksheet: any, columnIndex: string): boolean {
        
        let emptyCellCounter = 0;
        let nonEmptyCellCounter = 0;

        console.log('Checking if column: ' + columnNumericIndex + ' is really null. first row: ' + this.state.firstRowNumber + ' last row: ' + this.state.lastRowNumber);

        const column = worksheet.getColumn(columnNumericIndex);
        column.eachCell(function(cell, rowNumber) {
            console.log('column: '+ columnNumericIndex + ' cell: ' + cell + ' rowNo: ' + rowNumber);
            if (cell == '' || cell.value == ' ') {
                emptyCellCounter++;
            } else {
                nonEmptyCellCounter++;
            }
        });

        if(nonEmptyCellCounter < 1) {
            console.log('Column: ' + columnIndex + ' is deemed null for null cells counter: ' + nonEmptyCellCounter + ' emptyCellCounter: ' + emptyCellCounter);
            return true;
        } else {
            console.log('Column: ' + columnIndex + ' is not null for null cells counter: ' + nonEmptyCellCounter + ' emptyCellCounter: ' + emptyCellCounter);
            return false;
        }
    }

}