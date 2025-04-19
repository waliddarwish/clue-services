import { ClueDFSService } from '../../../clue-dfs-module/src/clue-dfs.service';
import { DatasetDataFile } from '../../../database-module/src/database.schemas';
import { WorkbookState } from './workbook-state';
import { WorksheetState } from './worksheet-state';
import { Worksheet } from './Worksheet';
import { DatasetDataFileObject } from '../../../object-schema/src/schemas/catalog.dataset-datafile';
import { ExcelConstants } from './Constants';
const got = require('got');
const ExcelJS = require('exceljs');

export class Workbook {
  private workbookState: WorkbookState;
  private dataFileProvider: any;
  constructor(private readonly clueDFSService: ClueDFSService,
    dataFileProvider: any
    ) {
    this.workbookState = new WorkbookState();
    this.dataFileProvider = dataFileProvider;
  }

  /**
   * 1. Render file url from the dfs service
   * 2. Using got to create a stream to that file
   * 3. Using the stream, get ExcelJS to load the workbook
   * 4. look over the worksheets and for every worksheet, create new worksheetHandler and pass the worksheet
   *
   * @param theDatafile
   */
  async handleWorkbook(theDatafile: DatasetDataFileObject): Promise<any> {

    this.workbookState.fileUrl  = await this.clueDFSService.renderFileUrl(theDatafile.volumeId, theDatafile.fid, null, false);
    //this.workbookState.fileUrl = 'http://127.0.0.1:10101/2,1060b762e9';
    const stream = got.stream(this.workbookState.fileUrl);
    stream.retryCount = 0;

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.read(stream);

    this.workbookState.worksheetsCount = workbook.worksheets.length;
    console.log('worksheetsCount: ' + this.workbookState.worksheetsCount);

    let sheetCounter = 0;
    let promiseArray = [];

    for (const sheet of workbook.worksheets) {
      console.log('handling worksheet: ' + sheetCounter);
      let worksheetState = new WorksheetState();
      worksheetState.sheetIndex = sheetCounter;
      this.workbookState.worksheetStates.push(worksheetState);
      promiseArray.push(new Worksheet(this.clueDFSService, this.dataFileProvider, worksheetState, theDatafile).handleWorkSheet(sheet));
      sheetCounter ++;
    }

    // update analyzer status 'partially failed', import-ready'
    Promise.all(promiseArray).then(async (results) => {
      console.log('Workbook results: ' + JSON.stringify(results));
      let partialFailureCounter = 0;
      let fullFailureCounter = 0;

      for (const result of results) {
          if (result.status === ExcelConstants.RESULT_FAILED) {
            partialFailureCounter++;
          } else if (result.status === ExcelConstants.RESULT_ALL_FAILED) {
            fullFailureCounter++;
          }
      }

      let importStatus = '';
      let analysisStatus = '';
      let errorMsg = '';

      if (fullFailureCounter === results.length) {
          importStatus = 'import-failed';
          analysisStatus = 'failed';
          errorMsg = 'File failed analysis';
      } else if (partialFailureCounter > 0) {
          importStatus = 'import-ready';
          analysisStatus = 'partially-failed';
          errorMsg = 'File failed analysis partially';
      } else {
          importStatus = 'import-ready';
          analysisStatus = 'complete';
      }

      await this.dataFileProvider.findOneAndUpdate({ id: theDatafile.id }, { analyzerStatus: analysisStatus, status: importStatus, errorMessage: errorMsg  },
        { new: true  ,safe: true , upsert: true}
        ).exec().then((result) => {
          console.log('Updated Datafile: ' + result);
        });
      
  });
    return {status: 0, message: 'Started'};
  }
}
