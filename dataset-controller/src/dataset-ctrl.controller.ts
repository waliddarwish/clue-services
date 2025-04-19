import { Controller, Body, Put, Delete } from '@nestjs/common';
import { DatasetCtrlService } from './dataset-ctrl.service';

@Controller('dataset-ctrl')
export class DatasetCrtlController {
  constructor(private readonly datasetCtrlService: DatasetCtrlService) {}

  @Put('create')
  async createTenantDatabase(@Body() body): Promise<any> {
    return this.datasetCtrlService
      .createTenantDatabase(body.clueSetting, body.tenantId, body.userId)
      .then(result => {
        return { status: 0, message: 'success', data: result };
      })
      .catch(error => {
        if (error.message) {
          return { status: -1, message: 'failed', data: error.message };
        } else {
          return { status: -1, message: 'failed', data: JSON.stringify(error) };
        }
      });
  }

  @Put('import-file')
  async importFile(@Body() body): Promise<any> {
    return this.datasetCtrlService
      .importFile(
        body.tenantDatasetDatabaseObject,
        body.dfsFileUrl,
        body.clueSetting,
        body.theDatafile,
        body.tableIndex,
      )
      .then(result => {
        const jsonImportResult = JSON.parse(result);
        return { status: 0, message: 'success', data: jsonImportResult };
      })
      .catch(error => {
        return { status: -1, message: 'failed', data: error.message };
      });
  }

  @Put('analyze-sample')
  async analyzeSample(@Body() body): Promise<any> {
    return this.datasetCtrlService
      .analyzeSample(body.sampleLines, body.theDatafile)
      .then(result => {
        return { status: 0, message: 'success', data: result };
      })
      .catch(error => {
        return { status: -1, message: 'failed', data: error };
      });
  }

  @Put('analyze-excel')
  async analyzeExcel(@Body() body): Promise<any> {
    return this.datasetCtrlService.analyzeExcel(body.theDatafile)
      .catch(error => {
        console.log('dataset-controller: Analyze Excel Error: ' + JSON.stringify(error));
        return { status: -1, message: 'failed', data: error };
      });
  }

  @Put('delete-dataset-table')
  async deleteDataset(@Body() body): Promise<any> {
    return this.datasetCtrlService
      .dropDatafileTable(
        body.tenantDatasetDatabaseObject,
        body.clueSetting,
        body.theDatafile,
        body.tableIndex,
      )
      .then(result => {
        return { status: 0, message: 'success', data: result };
      })
      .catch(error => {
        return { status: -1, message: 'failed', data: error };
      });
  }

  @Put('delete-database')
  async deleteDatabase(@Body() body): Promise<any> {
    return this.datasetCtrlService
      .dropDatabase(body.tenantDatasetDatabaseObject, body.clueSetting)
      .then(result => {
        return { status: 0, message: 'success', data: result };
      })
      .catch(error => {
        return { status: -1, message: 'failed', data: error };
      });
  }


  @Put('get-database-size')
  async getDatabaseSize(@Body() body): Promise<any> {
    return this.datasetCtrlService
      .getDatabaseSize(body.tenantDatasetDatabaseObject, body.clueSetting)
      .then(result => {
        return { status: 0, message: 'success', data: result };
      })
      .catch(error => {
        return { status: -1, message: 'failed', data: error };
      });
  }


}
