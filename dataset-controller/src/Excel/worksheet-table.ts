import { WorksheetTableState } from "./worksheet-table-state";
const HashMap = require('hashmap');
const ExcelJS = require('exceljs');
import { ClueDFSService } from "../../../clue-dfs-module/src/clue-dfs.service";
import { DatasetDataFileObject, DatasetFileTable, DataFileColumn } from "../../../object-schema/src/schemas/catalog.dataset-datafile";
import uuidv4 = require('uuid/v4');
import { ExcelConstants } from "./Constants";
import { ExcelHelper } from "./helpers";
var moment = require('moment'); // require

const COMMA_DELIMITER = ',';

export class WorksheetTable {
  state: WorksheetTableState;
  dataFile: DatasetDataFileObject;
  dataFileProvider: any;
  excelHelper:ExcelHelper;

  constructor(private readonly clueDFSService: ClueDFSService, dataFileProvider: any, state: WorksheetTableState, theDatafile: DatasetDataFileObject) {
    this.state = state;
    this.dataFile = theDatafile;
    this.dataFileProvider = dataFileProvider;
    this.excelHelper = new ExcelHelper();
  }
  /**
   * table: {
    name: 'financials_',
    displayName: 'financials',
    tableRef: 'A1:P701',
    totalsRow: false,
    headerRow: false,
    columns: [Array],
    autoFilterRef: 'A1:P701',
    style: [Object]
      }
  }
   */
  async handleTable(worksheet: any): Promise<any> {
    const tableDef = this.state.theTable.table;
    console.log('tableDef: ' + tableDef);
    this.state.tableName = tableDef.name;
    this.state.tableDisplayName = tableDef.displayName;
    const split = tableDef.tableRef.split(":");
    const startCell = split[0];
    const endCell = split[1];

    const startRow = startCell.split(/(\d+)/)[1];
    const startColumn = startCell.split(/(\d+)/)[0];
    const endRow = endCell.split(/(\d+)/)[1];
    const endColumn = endCell.split(/(\d+)/)[0];

    this.state.startColumn = startColumn;
    this.state.startRow = startRow;
    this.state.endColumn = endColumn;
    this.state.endRow = endRow;
    this.state.startCell = startCell;
    this.state.endCell = endCell;

    this.state.noOfRows = this.state.endRow - (+this.state.startRow + 1);
    console.log("State: ", this.state);
    return this.createTableObject().then(() => {
      return this.calculateDataTypes(worksheet);
    }).catch(async error => {
      // Update mongo
      console.log('worksheet-table exception: ' + JSON.stringify(error));
      await this.dataFileProvider.findOneAndUpdate({ id: this.dataFile.id, 'tables.id': this.state.tableRecord.id }, {
        '$set': {
          "tables.$.errorMessage" : JSON.stringify(error),
        }
      }, { new: true  ,safe: true , upsert: true}).exec();

      return {status: ExcelConstants.RESULT_FAILED};
    });
    
  }

  async createTableObject() {
    let table = new DatasetFileTable();
    // multiple of these will be created for excel. Excel analysis should generate them.
    table.id = uuidv4();
    if (this.state.tableDisplayName == '') {
      table.prettyName = this.state.sheetName + ' - ' + this.state.tableName;
    } else {
      table.prettyName = this.state.sheetName + ' - ' + this.state.tableDisplayName;
    }

      table.tableName = this.excelHelper.sanitizeString(this.state.sheetName) + '_' + this.excelHelper.sanitizeString(this.state.tableName);
      table.electedTableName = table.tableName.toLowerCase();
      if (table.electedTableName.length > 50) {
        table.electedTableName = table.electedTableName.substr(0, 50);
    }
    let electedTableId = uuidv4();
    electedTableId = electedTableId.substr(electedTableId.lastIndexOf("-") + 1) ;
    table.electedTableName = table.electedTableName + '_' + electedTableId;


    table.fileExtension = 'CSV';
    table.tableColumns = [];

    this.state.tableRecord = table;
    //console.log("Table: ", this.state.tableRecord);

    return this.dataFileProvider.findOneAndUpdate({ id: this.dataFile.id }, { $push: { tables: table } });
  }

  /**
   * 
   * @param worksheet   ValueType: {
  Null: 0,
  Merge: 1,
  Number: 2,
  String: 3,
  Date: 4,
  Hyperlink: 5,
  Formula: 6,
  SharedString: 7,
  RichText: 8,
  Boolean: 9,
  Error: 10,
},
FormulaType: {
  None: 0,
  Master: 1,
  Shared: 2,
},
RelationshipType: {
  None: 0,
  OfficeDocument: 1,
  Worksheet: 2,
  CalcChain: 3,
  SharedStrings: 4,
  Styles: 5,
  Theme: 6,
  Hyperlink: 7,
},
DocumentType: {
  Xlsx: 1,
},
ReadingOrder: {
  LeftToRight: 1,
  RightToLeft: 2,
},
ErrorValue: {
  NotApplicable: '#N/A',
  Ref: '#REF!',
  Name: '#NAME?',
  DivZero: '#DIV/0!',
  Null: '#NULL!',
  Value: '#VALUE!',
  Num: '#NUM!',
},
   */
  async calculateDataTypes(worksheet: any): Promise<any> {

    let targetSamplePercent = 10;
    if (this.state.noOfRows < 1000) {
      targetSamplePercent = 10;
    } else if (this.state.noOfRows < 10000) {
      targetSamplePercent = 5;
    } else if (this.state.noOfRows < 100000) {
      targetSamplePercent = 1;
    } else {
      targetSamplePercent = .5;
    }

    const percent = (targetSamplePercent / 100) * this.state.noOfRows;
    const stepSize = Math.round(this.state.noOfRows / percent);
    let stepTracker = +this.state.startRow + 1;

    let sampleRowsIndexes = [];
    console.log('Percent: ' + percent + ' stepSize: ' + stepSize + ' this.state.noOfRows: ' + this.state.noOfRows + ' stepTracker: ' + stepTracker);
    while ((+stepTracker + +stepSize) < this.state.noOfRows) {
      let row = worksheet.getRow(stepTracker);

      sampleRowsIndexes.push(stepTracker);
      stepTracker = +stepTracker + +stepSize;
    }

    this.state.sampleLinesLength = sampleRowsIndexes.length;

    let sampleRows = [];
    for (let i = 0; i < sampleRowsIndexes.length; i++) {
      const rowNumber = sampleRowsIndexes[i];
      let nextColumn = this.state.startColumn;
      const lastColumn = this.excelHelper.incrementString(this.state.endColumn);
      let cells = [];
      while (nextColumn != lastColumn) {

        const cell = worksheet.getCell(nextColumn + rowNumber);
        //console.log('Getting Cell at: ' + nextColumn + rowNumber + ' Cell: ' + cell );
        cells.push(cell);
        nextColumn = this.excelHelper.incrementString(nextColumn, this.state.emptyColumns);
      }
      { }
      sampleRows.push({ rowNo: rowNumber, cellInfo: cells });
    }

    //console.log (sampleRows);
    console.log('Sample size: ' + sampleRows.length + ' of: ' + this.state.noOfRows);
    // Sample Column Cells 

    this.sampleColumns(sampleRowsIndexes, worksheet);
    this.electColumnsDataType(sampleRowsIndexes, worksheet);
    this.electHeader(worksheet);
    return this.writeTableToDFS(worksheet).then( () => {
      return this.updateTableStatus();
      } 
    )

  }


  sampleColumns(sampleRowsIndexes: any[], worksheet: any) {
    var columnInfoMap = new HashMap();
    let nextColumn = this.state.startColumn;
    const lastColumn = this.excelHelper.incrementString(this.state.endColumn);

    console.log('Sampling startColumn: ' + nextColumn);
    console.log('Sampling lastColumn: ' + lastColumn);
    let columnInfo;
    let noOfColumns = 0;
    while (nextColumn != lastColumn) {
      if (columnInfoMap.get(nextColumn) == null) {
        columnInfo = { suggestedHeader: 'Header_' + nextColumn, nullIndex: 0, mergeIndex: 0, numberIndex: 0, stringIndex: 0, dateIndex: 0, hyperlinkIndex: 0, formulaIndex: 0, sharedStringIndex: 0, richTextIndex: 0, booleanIndex: 0, errorIndex: 0 };
        columnInfoMap.set(nextColumn, columnInfo);
      } else {
        columnInfo = columnInfoMap.get(nextColumn);
      }

      for (let i = 0; i < sampleRowsIndexes.length; i++) {
        const rowNumber = sampleRowsIndexes[i];
        const cell = worksheet.getCell(rowNumber + nextColumn);

        switch (cell.type) {
          case ExcelJS.ValueType.Null:
            columnInfo.nullIndex = columnInfo.nullIndex + 1;
            break;
          case ExcelJS.ValueType.Merge:
            columnInfo.mergeIndex = columnInfo.mergeIndex + 1;
            break;
          case ExcelJS.ValueType.Number:
            columnInfo.numberIndex = columnInfo.numberIndex + 1;
            break;
          case ExcelJS.ValueType.String:
            columnInfo.stringIndex = columnInfo.stringIndex + 1;
            break;
          case ExcelJS.ValueType.Date:
            columnInfo.dateIndex = columnInfo.dateIndex + 1;
            break;
          case ExcelJS.ValueType.Hyperlink:
            columnInfo.hyperlinkIndex = columnInfo.hyperlinkIndex + 1;
            break;
          case ExcelJS.ValueType.Formula:
            columnInfo.formulaIndex = columnInfo.formulaIndex + 1;
            break;
          case ExcelJS.ValueType.SharedString:
            columnInfo.sharedStringIndex = columnInfo.sharedStringIndex + 1;
            break;
          case ExcelJS.ValueType.RichText:
            columnInfo.richTextIndex = columnInfo.richTextIndex + 1;
            break;
          case ExcelJS.ValueType.Boolean:
            columnInfo.booleanIndex = columnInfo.booleanIndex + 1;
            break;
          case ExcelJS.ValueType.Error:
            columnInfo.errorIndex = columnInfo.errorIndex + 1;
            break;
          default:
            columnInfo.stringIndex = columnInfo.stringIndex + 1;
            break;
        }
      }
      columnInfoMap.set(nextColumn, columnInfo);
      nextColumn = this.excelHelper.incrementString(nextColumn, this.state.emptyColumns);
      noOfColumns++;
    }

    this.state.noOfColumns = noOfColumns;
    this.state.columnInfoMap = columnInfoMap;

  }


  /**
   * 
   * columnInfo = { suggestedHeader: 'Header_' + nextColumn, nullIndex: 0, mergeIndex: 0, numberIndex: 0, 
   * stringIndex: 0, dateIndex: 0, hyperlinkIndex: 0, formulaIndex: 0, 
   * sharedStringIndex: 0, richTextIndex: 0, booleanIndex: 0, errorIndex: 0};
   * @param worksheet 
   */
  electColumnsDataType(sampleRowsIndexes: any[], worksheet: any) {

    let samplesLength = sampleRowsIndexes.length;
    let targetMatchPercent = 70;

    let columnInfoMap = this.state.columnInfoMap;
    for (const columnInfoStructure of columnInfoMap) {
      let columnInfo = columnInfoStructure.value;

      let electedType = '';
      let nullPercent = (columnInfo.nullIndex === 0) ? 0 : columnInfo.nullIndex * 100 / samplesLength;
      let mergePercent = (columnInfo.mergeIndex === 0) ? 0 : columnInfo.mergeIndex * 100 / samplesLength;
      let numberPercent = (columnInfo.numberIndex === 0) ? 0 : columnInfo.numberIndex * 100 / samplesLength;
      let stringPercent = (columnInfo.stringIndex === 0) ? 0 : columnInfo.stringIndex * 100 / samplesLength;
      let datePercent = (columnInfo.dateIndex === 0) ? 0 : columnInfo.dateIndex * 100 / samplesLength;
      let hyperLinkPercent = (columnInfo.hyperlinkIndex === 0) ? 0 : columnInfo.hyperlinkIndex * 100 / samplesLength;
      let formulaPercent = (columnInfo.formulaIndex === 0) ? 0 : columnInfo.formulaIndex * 100 / samplesLength;
      let sharedStringPercent = (columnInfo.sharedStringIndex === 0) ? 0 : columnInfo.sharedStringIndex * 100 / samplesLength;
      let richTextPercent = (columnInfo.richTextIndex === 0) ? 0 : columnInfo.richTextIndex * 100 / samplesLength;
      let booleanPercent = (columnInfo.booleanIndex === 0) ? 0 : columnInfo.booleanIndex * 100 / samplesLength;
      let errorPercent = (columnInfo.errorIndex === 0) ? 0 : columnInfo.errorIndex * 100 / samplesLength;


      if (datePercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_DATE;
      } else if (numberPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_NUMERIC;
      } else if (booleanPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_BOOLEAN;
      } else if (nullPercent >= targetMatchPercent) { // matching all other types to string
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else if (mergePercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else if (hyperLinkPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else if (formulaPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else if (sharedStringPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else if (richTextPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else if (errorPercent >= targetMatchPercent) {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      } else {
        electedType = ExcelConstants.DATA_TYPE_STRING;
      }

      columnInfo.electedType = electedType;
      columnInfo.nullPercent = nullPercent;
      columnInfo.mergePercent = mergePercent;
      columnInfo.numberPercent = numberPercent;
      columnInfo.stringPercent = stringPercent;
      columnInfo.datePercent = datePercent;
      columnInfo.hyperLinkPercent = hyperLinkPercent;
      columnInfo.formulaPercent = formulaPercent;
      columnInfo.sharedStringPercent = sharedStringPercent;
      columnInfo.richTextPercent = richTextPercent;
      columnInfo.booleanPercent = booleanPercent;
      columnInfo.errorPercent = errorPercent;


      columnInfoMap.set(columnInfoStructure.key, columnInfo);
    }

    this.state.columnInfoMap = columnInfoMap;
  }


  /**
   * 
   * @param sampleRowsIndexes {"suggestedHeader":"Header_A","nullIndex":0,"mergeIndex":0,"numberIndex":0,
   * "stringIndex":68,"dateIndex":0,"hyperlinkIndex":0,"formulaIndex":0,"sharedStringIndex":0,"richTextIndex":0,
   * "booleanIndex":0,"errorIndex":0,"electedType":"string","nullPercent":0,"mergePercent":0,"numberPercent":0,
   * "stringPercent":100,"datePercent":0,"hyperLinkPercent":0,"formulaPercent":0,"sharedStringPercent":0,"richTextPercent":0,"errorPercent":0}
   * @param worksheet 
   */
  electHeader(worksheet: any) {
    let targetSamplePercent = 10;

    var nonStringColumnWithMatchingHeaderTypeCounter = 0;
    var nonStringColumnWithStringHeaderTypeCounter = 0;

    const percent = (targetSamplePercent / 100) * this.state.noOfRows;
    let columnInfoMap = this.state.columnInfoMap;
    for (const columnInfoStructure of columnInfoMap) {
      let columnInfo = columnInfoStructure.value;
      let columnKey = columnInfoStructure.key;

      const headerCell = worksheet.getCell(columnKey + this.state.startRow);
      let headerCellType = this.electCellType(headerCell);
      columnInfo.headerCellType = headerCellType;
      columnInfoMap.set(columnKey, columnInfo);

      if (columnInfo.electedType != ExcelConstants.DATA_TYPE_STRING) {
        if (headerCellType == columnInfo.electedType) {
          nonStringColumnWithMatchingHeaderTypeCounter++;
        } else {
          nonStringColumnWithStringHeaderTypeCounter++;
        }
      }
    }


    for (const columnInfoStructure of columnInfoMap) {
      let columnInfo = columnInfoStructure.value;
      let columnKey = columnInfoStructure.key;
      const headerCell = worksheet.getCell(columnKey + this.state.startRow);

      if (nonStringColumnWithStringHeaderTypeCounter > nonStringColumnWithMatchingHeaderTypeCounter) {
        columnInfo.electedHeaderName = headerCell.value;
        columnInfo.skipHeader = 1;
      } else {
        columnInfo.electedHeaderName = columnInfo.suggestedHeader;
      }

      columnInfo.electedHeaderName = this.excelHelper.sanitizeStringKeepUnderscore(columnInfo.electedHeaderName);
      if (columnInfo.electedHeaderName.length > 63) {
        columnInfo.electedHeaderName = columnInfo.electedHeaderName.substr(0, 60);
      }

      let dataFileColumn = new DataFileColumn();
      dataFileColumn.id = uuidv4();
      dataFileColumn.columnPrettyName = columnInfo.electedHeaderName;
      dataFileColumn.electedHeaderName = this.excelHelper.sanitizeStringKeepUnderscore(columnInfo.electedHeaderName).toLowerCase();
      dataFileColumn.electedType = columnInfo.electedType;
      this.state.tableRecord.tableColumns.push(dataFileColumn);
      if (columnInfo.skipHeader) {
        this.state.tableRecord.skipHeader = true;
      }

      columnInfoMap.set(columnKey, columnInfo);
    }

    this.state.columnInfoMap = columnInfoMap;
  }



  async writeTableToDFS(worksheet: any): Promise<any> {

    const lastColumn = this.excelHelper.incrementString(this.state.endColumn);
    //console.log('lastColumn: ' + lastColumn);

    let tableBuffer = new Buffer('');
    for (let rowNumber = 1; rowNumber <= this.state.endRow; rowNumber++) {
      if (this.state.validRows.length != 0 && this.state.validRows.indexOf(rowNumber) === -1) {
        continue;
      }
      
      let nextColumn = this.state.startColumn;

      let line = '';
      while (nextColumn != lastColumn) {
        const cell = worksheet.getCell(nextColumn + rowNumber);
        //console.log('Cell ' + cell.value + ' type: ' + cell.type);
        if (cell.type === ExcelJS.ValueType.Number && (cell.value == null || cell.value == '')){
          line += '0';
        } else if (cell.type === ExcelJS.ValueType.Date && (cell.value != null && cell.value != '')){

          line +=  moment(cell.value).format("DD MMM YYYY hh:mm A");
        } else {

          line += this.excelHelper.prepareCellForCSV(cell.value ) ;
        }
        line += COMMA_DELIMITER;
        nextColumn = this.excelHelper.incrementString(nextColumn, this.state.emptyColumns);
      }
      line = line.substring(0, line.length - 1);
      line += '\n';
      //console.log('rowNo: ' + rowNumber + ' line: ' + line);
      const lineBuff = Buffer.from(line);
      tableBuffer = Buffer.concat([tableBuffer, lineBuff]);

    }

    return this.clueDFSService.writeBuffer(tableBuffer, []).then(result => {
      this.state.csvFid = result;
      return result;
    });
    
  }

  async updateTableStatus(): Promise<any> {
    const fidParts = this.state.csvFid.fid.split(',');
    this.state.tableRecord.fileName = this.state.csvFid.fid;
    this.state.tableRecord.fid = fidParts[1];
    this.state.tableRecord.volumeId = fidParts[0];
    this.state.tableRecord.status = 'import-ready';
    this.state.tableRecord.analyzerStatus = 'complete';
    this.state.tableRecord.dfsUrl = this.state.csvFid.url;
    this.state.tableRecord.dfsPublicUrl = this.state.csvFid.publicUrl;
    this.state.tableRecord.fileExtension = 'CSV'; // TODO: check renderFileUrl logic
    this.state.tableRecord.sampleSize = this.state.sampleLinesLength;
    this.state.tableRecord.numberOfLines = this.state.noOfRows;
    this.state.tableRecord.electedDelimiter = COMMA_DELIMITER;
    this.state.tableRecord.fileSize = this.state.csvFid.size;
    this.state.tableRecord.fileSizeInDFS = this.state.csvFid.size;
    this.state.tableRecord.strictQuote = 'ON';

    console.log("Updaing mongo");
    console.log("FileID: " + this.dataFile.id);
    console.log("TableId: " + this.state.tableRecord.id);
    return this.dataFileProvider.findOneAndUpdate({ id: this.dataFile.id, 'tables.id': this.state.tableRecord.id }, {
      '$set': {
        "tables.$.fileName" : this.state.tableRecord.fileName,
        "tables.$.fid" : this.state.tableRecord.fid,
        "tables.$.volumeId" : this.state.tableRecord.volumeId,
        "tables.$.status" : this.state.tableRecord.status,
        "tables.$.analyzerStatus" : this.state.tableRecord.analyzerStatus,
        "tables.$.dfsUrl" : this.state.tableRecord.dfsUrl,
        "tables.$.dfsPublicUrl" : this.state.tableRecord.dfsPublicUrl,
        "tables.$.fileExtension" : this.state.tableRecord.fileExtension,
        "tables.$.sampleSize" : this.state.tableRecord.sampleSize,
        "tables.$.numberOfLines" : this.state.tableRecord.numberOfLines,
        "tables.$.electedDelimiter" : this.state.tableRecord.electedDelimiter,
        "tables.$.fileSize" : this.state.tableRecord.fileSize,
        "tables.$.fileSizeInDFS" : this.state.tableRecord.fileSizeInDFS,
        "tables.$.tableColumns" : this.state.tableRecord.tableColumns,
        "tables.$.skipHeader" : this.state.tableRecord.skipHeader,
        "tables.$.strictQuote" : this.state.tableRecord.strictQuote
      }
    }, { new: true  ,safe: true , upsert: true}).exec().then((result) => {
      //console.log(result) 
       return {status: ExcelConstants.RESULT_SUCCESS};
     });

  }



  electCellType(cell): string {
    let cellType;
    switch (cell.type) {
      case ExcelJS.ValueType.Null:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.Merge:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.Number:
        cellType = ExcelConstants.DATA_TYPE_NUMERIC;
        break;
      case ExcelJS.ValueType.String:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.Date:
        cellType = ExcelConstants.DATA_TYPE_DATE;
        break;
      case ExcelJS.ValueType.Hyperlink:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.Formula:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.SharedString:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.RichText:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      case ExcelJS.ValueType.Boolean:
        cellType = ExcelConstants.DATA_TYPE_BOOLEAN;
        break;
      case ExcelJS.ValueType.Error:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
      default:
        cellType = ExcelConstants.DATA_TYPE_STRING;
        break;
    }
    return cellType;
  }

}