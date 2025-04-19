

import { Test } from '@nestjs/testing';
import { DatasetCtrlService } from './dataset-ctrl.service';
import { FileImporter } from './FileImporter';
const HashMap = require('hashmap');
import datasetConfig = require('../config/config.json');
import pg from 'pg';
import { async } from 'rxjs/internal/scheduler/async';
const shell = require('shelljs');
import os from 'os';
import { TenantDatasetDatabaseObject } from '../../object-schema/src/schemas/catalog.tenant-dataset-database';
const fs = require('fs');


describe('Test dataset controller service', () => {
    let datasetControllerService;
    let dataFileProvider;
    let tenantDatasetDatabaseProvider;
    let client;

    let clueSetting = {
        datasetDatabaseCACert : 'cert',
        datasetDatabaseRootUserKey: 'key',
        datasetDatabaseRootUserCert: 'cert2'
    };
    let theDatafile = {
        tables: [{
            electedTableName: 'electedTableName',
            tableColumns: [
                {electedHeaderName: 'header1', electedType: 'Number'},
                {electedHeaderName: 'header2', electedType: 'String'}
            ],
            electedDelimiter: ',',
            skipHeader: false
        }]
       
    };

    let tenantDatasetDatabaseObject = {
        tenantDatabaseName: 'tenant db name',
    };



    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
            ]
        }).compile();


        dataFileProvider = {
            exec: jest.fn().mockImplementation(() => (dataFileProvider)),
            findOneAndUpdate: jest.fn().mockImplementation(() => (dataFileProvider)),
            findOne: jest.fn().mockImplementation(() => (dataFileProvider)),
        };
        tenantDatasetDatabaseProvider = {
            exec: jest.fn(),
            findOneAndUpdate: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            findOne: jest.fn().mockImplementation(() => (tenantDatasetDatabaseProvider)),
            save:  jest.fn(),
            create : jest.fn()
        };

        datasetControllerService = new DatasetCtrlService(tenantDatasetDatabaseProvider, dataFileProvider);
        
        client = {
            connect: jest.fn(),
            query: jest.fn(),
            end: jest.fn(),
            release: jest.fn(), 
            queryclient: jest.fn().mockImplementation(()=> client),
          };

        let pool =   {
            connect: jest.fn().mockImplementation(()=> client),
            end: jest.fn(),
        }

        jest.genMockFromModule('pg');
        jest.mock('pg');
        pg.Pool = jest.fn().mockImplementation(() => pool);
    
    });

    describe('Test DatasetCtrlService.analyzeSample', ()=> {
        let sampleLines = [];
        let theDatafile = {
            tables: [
                {
                    fileName: 'name', 
                    fileColumns: [], 
                    numberOfLines: 10,
                    skipHeader: true,
                    sampleSize: 100,
                    electedDelimiter: '',
                    strictQuote: '',
                    electedTableName: ''
                }
            ]
           
        };
        
        let columnInfoMap = new HashMap();

        it('Analyze the sample successfuly', async () => {
           
            let expectedResult = {
                analyzerStatus: 'complete',
                skipHeader: theDatafile.tables[0].skipHeader,
                sampleSize: theDatafile.tables[0].sampleSize,
                numberOfLines: theDatafile.tables[0].numberOfLines,
                electedDelimiter: theDatafile.tables[0].electedDelimiter,
                strictQuote: theDatafile.tables[0].strictQuote,
                electedTableName: theDatafile.tables[0].electedTableName,
                fileColumns: theDatafile.tables[0].fileColumns
            };
            jest.spyOn(FileImporter.prototype, 'extractDelimeter').mockImplementation(jest.fn().mockImplementationOnce(()=> {})).mockReturnValueOnce(',');
            jest.spyOn(FileImporter.prototype, 'extractStrictQuotes').mockImplementation(jest.fn().mockImplementationOnce(()=> {})).mockReturnValue('OFF');
            jest.spyOn(FileImporter.prototype, 'extractDataTypes').mockImplementation(jest.fn().mockImplementationOnce(()=> {})).mockReturnValue(columnInfoMap);
            dataFileProvider.exec.mockResolvedValue(expectedResult);

            let actualResult = await datasetControllerService.analyzeSample(sampleLines, theDatafile);
            expect(actualResult).toEqual(expectedResult);
            });

            it('Fail to save the datafile', async () => {
                let expectedResult = new Error('failed');

                jest.spyOn(FileImporter.prototype, 'extractDelimeter').mockImplementation(jest.fn().mockImplementationOnce(()=> {})).mockReturnValueOnce(',');
                jest.spyOn(FileImporter.prototype, 'extractStrictQuotes').mockImplementation(jest.fn().mockImplementationOnce(()=> {})).mockReturnValue('OFF');
                jest.spyOn(FileImporter.prototype, 'extractDataTypes').mockImplementation(jest.fn().mockImplementationOnce(()=> {})).mockReturnValue(columnInfoMap);
                dataFileProvider.exec.mockResolvedValue(expectedResult);
    
                let actualResult = await datasetControllerService.analyzeSample(sampleLines, theDatafile);
                expect(actualResult).toEqual(expectedResult);
                });

        });


        describe('Test DatasetCtrlService.importFile', ()=> {
            let dfsFileUrl = 'file url';
            let expectedResult = { jobId: "112345", status: 'successful'};
            let mockedResult = { rows: [{
                job_id: "112345", status: 'successful'
            }], rowCount: 1 };


            it('Import the file successfully', async ()=> {
   
                client.query = jest.fn().mockResolvedValueOnce(mockedResult).mockResolvedValueOnce(mockedResult);

                let result = await datasetControllerService.importFile(tenantDatasetDatabaseObject, dfsFileUrl, clueSetting, theDatafile , 0);
                expect(result).toEqual(JSON.stringify(expectedResult));
                expect(client.query).toBeCalledTimes(2);
                expect(client.query.mock.calls[0][0]).toBe('DROP TABLE IF EXISTS ' + theDatafile.tables[0].electedTableName + ';')
                expect(client.query.mock.calls[1][0]).toBe('IMPORT TABLE electedTableName (header1 numeric NULL, header2 String)  CSV DATA (\'file url\') WITH delimiter = \',\' , nullif = \'\' ;');
                expect(client.release).toBeCalledTimes(1);
            });

            it('Import the file successfully with skipped header', async ()=> {
                theDatafile.tables[0].skipHeader = true;
                client.query = jest.fn().mockResolvedValueOnce(mockedResult).mockResolvedValueOnce(mockedResult);

                let result = await datasetControllerService.importFile(tenantDatasetDatabaseObject, dfsFileUrl, clueSetting, theDatafile , 0);
                expect(result).toEqual(JSON.stringify(expectedResult));
                expect(client.query).toBeCalledTimes(2);
                expect(client.query.mock.calls[0][0]).toBe('DROP TABLE IF EXISTS ' + theDatafile.tables[0].electedTableName + ';')
                expect(client.query.mock.calls[1][0]).toBe('IMPORT TABLE electedTableName (header1 numeric NULL, header2 String)  CSV DATA (\'file url\') WITH delimiter = \',\' , skip = \'1\' , nullif = \'\' ;');
                expect(client.release).toBeCalledTimes(1);
            });

            it('Import will throw an exception', async ()=> {
                client.query = jest.fn().mockResolvedValueOnce(mockedResult).mockResolvedValueOnce(new Error());
                await datasetControllerService.importFile(tenantDatasetDatabaseObject, dfsFileUrl, clueSetting, theDatafile , 0);
                expect(client.release).toBeCalledTimes(1);            
            });
        });


        describe('Test DatasetCtrlService.dropDatafileTable', ()=> {
            let dropStatement = 'DROP TABLE IF EXISTS ' + theDatafile.tables[0].electedTableName + ';';
            it('Drops the dataset successfully', async ()=> {

                client.query = jest.fn().mockResolvedValueOnce({});
                let result = await datasetControllerService.dropDatafileTable(tenantDatasetDatabaseObject, clueSetting, theDatafile ,0 );
                expect(result).toEqual({ status: 0, data: {} });
                expect(client.query).toBeCalledTimes(1);
                expect(client.query.mock.calls[0][0]).toBe(dropStatement);
                expect(client.release).toBeCalledTimes(1);
            });

            it('Query will throw an exception', async ()=> {
                client.query = jest.fn().mockResolvedValueOnce(new Error());
                await datasetControllerService.dropDatafileTable(tenantDatasetDatabaseObject, clueSetting, theDatafile , 0);
                expect(client.release).toBeCalledTimes(1);            
            });
        });


        describe('Test DatasetCtrlService.dropDatabase', ()=> {
            let dropStatement = 'drop database if exists ' + tenantDatasetDatabaseObject.tenantDatabaseName + ' cascade';
            it('Drops the database successfully', async ()=> {

                client.queryclient.query = jest.fn().mockResolvedValueOnce({});
                let result = await datasetControllerService.dropDatabase(tenantDatasetDatabaseObject, clueSetting);
                expect(result).toEqual({ status: 0, data: {} });
                expect(client.queryclient.query).toBeCalledTimes(1);
                expect(client.queryclient.query.mock.calls[0][0]).toBe(dropStatement);
                expect(client.release).toBeCalledTimes(1);
            });
            
            it('Query will throw an exception', async ()=> {
                client.queryclient.query = jest.fn().mockResolvedValueOnce(new Error());
                await datasetControllerService.dropDatabase(tenantDatasetDatabaseObject, clueSetting);
                expect(client.release).toBeCalledTimes(1);            
            });
        });


        describe('Test DatasetCtrlService.createTenantDatabase', ()=> {
            let originalTenantId = '12345';
            let originalUserId = '65837';
            const uniquId = originalTenantId.substr(0, originalTenantId.indexOf('-'));
            const userId = 'user_' + uniquId;
            const dbId = 'db_' + uniquId;
            let baseDirectory = 'currentDir';
            const certificateDirectory = baseDirectory + '/cert/';
            const caKeyFile = certificateDirectory + 'ca.key';
            const tenantCrtFile = certificateDirectory + 'client.' + userId + '.crt';
            const tenantKeyFile = certificateDirectory + 'client.' + userId + '.key';
      
            const readFileSyncReturn = 'file contents';

            let createCertCommand = baseDirectory;
            createCertCommand += '/linux/';
    
            createCertCommand += 'cockroach cert create-client ';
            createCertCommand += userId + ' ';
            createCertCommand += '--certs-dir=' + certificateDirectory + ' ';
            createCertCommand += '--ca-key=' + caKeyFile;

            beforeEach(async () => {
                jest.genMockFromModule('shelljs');
                jest.mock('shelljs');
                shell.pwd = jest.fn().mockImplementation(() => baseDirectory);
                shell.exec = jest.fn().mockImplementation(() => 'done');
                shell.ls = jest.fn().mockImplementation(() => ['firstcertFile', 'secondCertFile']);
                shell.rm = jest.fn().mockImplementation(() => 'done');

                jest.genMockFromModule('os');
                jest.mock('os');
                os.platform = jest.fn().mockImplementation(() => 'os');

                jest.genMockFromModule('fs');
                jest.mock('fs');
                fs.readFileSync = jest.fn().mockImplementation(() => readFileSyncReturn);

            });

            it('Creates tenant database successfully', async ()=> {
            
                client.query = jest.fn().mockResolvedValueOnce({})
                                .mockResolvedValueOnce({})
                                .mockResolvedValueOnce({})
                                .mockResolvedValueOnce({})
                                .mockResolvedValueOnce({})
                                ;
                const tenantDatasetObject = new TenantDatasetDatabaseObject();
                fs.readFileSync = jest.fn().mockImplementationOnce(()=> readFileSyncReturn);

                tenantDatasetDatabaseProvider.create.mockResolvedValue(tenantDatasetObject);
                let result = await datasetControllerService.createTenantDatabase(clueSetting, originalTenantId, originalUserId);
                
                expect(client.query).toBeCalledTimes(5);
                expect(client.query.mock.calls[0][0]).toBe('drop database if exists ' + dbId + ' cascade');
                expect(client.query.mock.calls[1][0]).toBe('CREATE DATABASE ' + dbId + ' ENCODING = \'UTF-8\'');
                expect(client.query.mock.calls[2][0]).toBe('CREATE USER IF NOT EXISTS ' + userId);
                expect(client.query.mock.calls[3][0]).toBe('GRANT ALL ON DATABASE ' + dbId + ' TO ' + userId);
                expect(client.query.mock.calls[4][0]).toBe('GRANT ALL ON DATABASE ' + dbId + ' TO dsuser');
                expect(client.release).toBeCalledTimes(1);

                expect(shell.pwd).toHaveBeenCalled();
                expect(shell.exec).toHaveBeenCalledTimes(2);
                expect(shell.exec.mock.calls[0][0]).toBe('mkdir -p ' + certificateDirectory);
                expect(shell.exec.mock.calls[1][0]).toBe(createCertCommand);

                expect(fs.readFileSync).toHaveBeenCalledTimes(2);

                expect(shell.rm).toHaveBeenCalledTimes(2);
                expect(shell.rm.mock.calls[0][0]).toBe('-f');
                expect(shell.rm.mock.calls[0][1]).toBe(tenantKeyFile);

                expect(shell.rm.mock.calls[1][0]).toBe('-f');
                expect(shell.rm.mock.calls[1][1]).toBe(tenantCrtFile);
                
                expect(tenantDatasetDatabaseProvider.create).toHaveBeenCalledTimes(1);

              
                expect(result).toEqual({ status: 0, data: tenantDatasetObject });

            });

        });

    });
