import { ClueDFSService } from "../../clue-dfs-module/src/clue-dfs.service";
const download = require('download');
const ExcelJS = require('exceljs');
const fs = require('fs');
const xlsx = require('xlsx');
const got = require('got');



export class ExcelFileImporter{

    constructor(private readonly clueDFSService: ClueDFSService){}


    /**
     * 
     */
    async analyzeFile() {

        this.clueDFSService.initWeedConfig({
            server:		"dfs-master-001",
            port:		9500
        });
        let volume = '5';
        let fileId = '168241aa28';

        try {
            let theFileUrl = await this.clueDFSService.renderFileUrl(volume, fileId, null, true);
            console.log('FileUrl' + theFileUrl);

            await download(theFileUrl, './src');
       
            let writeStream;
        	const stream = got.stream(theFileUrl);
            stream.retryCount = 0;

            const workbook = new ExcelJS.Workbook();

            await workbook.xlsx.read(stream);

            const worksheet = workbook.worksheets[0];


            const row = worksheet.getRow(1);
            console.log('row: ' +row);
            row.eachCell(function(cell, colNumber) {
                console.log('Cell ' + colNumber + ' = ' + cell.value + ':' + cell.type);
              });

              worksheet.getRow(2).eachCell(function(cell, colNumber) {
                console.log('Cell ' + colNumber + ' = ' + cell.value + ':' + cell.type);
              });
            /*
                      await fetch(theFileUrl)
            .then(res => {
                console.log('inside fetcher response');
                stream = fs.createWriteStream('./octocat.png');
                res.body.pipe(stream);
            });
            // This line opens the file as a readable stream
            var readStream = fs.createReadStream(filename);
            console.log('after creating the stream');
            const workbook = new ExcelJS.Workbook();
            console.log('After the workbook');
            let fileStream = await this.clueDFSService.readFileStream('5,168241aa28', readStream);
            //let file = await this.clueDFSService.readFile('5,168241aa28');
            console.log('after reading the stream');
            console.log(fileStream);
            //await workbook.xlsx.read(fileStream);
            //console.log(workbook.actualColumnCount);
            */
        } catch (error) {
            console.log('error');
            console.log(error);
        }

    }
}

