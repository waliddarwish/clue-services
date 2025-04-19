import { Injectable, Inject } from '@nestjs/common';
import { ClueSettings, TenantDatasetDatabase, DatasetDataFile } from '../../database-module/src/database.schemas';
import { TenantDatasetDatabaseObject } from '../../object-schema/src/schemas/catalog.tenant-dataset-database';
var pg = require('pg');
import * as fs from 'fs';
import uuidv4 = require('uuid/v4');
const os = require('os');
const shell = require('shelljs');
import { Model } from 'mongoose';
import datasetConfig = require('../config/config.json');
import { FileImporter } from './FileImporter';
import { DatasetDataFileObject, DataFileColumn } from '../../object-schema/src/schemas/catalog.dataset-datafile';
import { ClueDFSService } from '../../clue-dfs-module/src/clue-dfs.service';
import { Workbook } from './Excel/Workbook';
const HashMap = require('hashmap');



@Injectable()
export class DatasetCtrlService {
    constructor(
        @Inject('TenantDatasetDatabaseProvider') private readonly tenantDatasetDatabaseProvider: Model<TenantDatasetDatabase>,
        @Inject('datasetDataFileProvider') private readonly dataFileProvider: Model<DatasetDataFile>,
        private readonly clueDFSService: ClueDFSService
    ) { 
        this.clueDFSService.initWeedConfig({
            server:		"dfs-master-001",
            port:		9500
        });
    }

    // Excel analysis should be different
    async analyzeSample(sampleLines: [], theDatafile: DatasetDataFileObject): Promise<any> {
        try {
            let tableName = theDatafile.tables[0].fileName;
            if (theDatafile.tables[0].fileName.indexOf('.') > -1) {
                tableName = tableName.substr(0, tableName.indexOf('.'));
            }
            tableName = tableName.replace(/-/g, '_');
            tableName = tableName.replace(/\s/g, '_')
            tableName = 'table_' + tableName;
            if (tableName.length > 63) {
                tableName = tableName.substr(0, 60);
            }

            let electedTableName = tableName;
            if (electedTableName.length > 50) {
                electedTableName = electedTableName.substr(0, 50);
            }
            let electedTableId = uuidv4();
            electedTableId = electedTableId.substr(electedTableId.lastIndexOf("-") + 1) ;
            electedTableName = electedTableName + '_' + electedTableId;


            let skipHeader = false;
            let fileImporter = new FileImporter();
            const delimeter = fileImporter.extractDelimeter(sampleLines);
            const strictQuoteValue = fileImporter.extractStrictQuotes(sampleLines, delimeter);
            let columnInfoMap = new HashMap();
            columnInfoMap = fileImporter.extractDataTypes(sampleLines, delimeter);

            // For CSV case, loop for excel?
            theDatafile.tables[0].tableColumns = [];

            for (const columnPair of columnInfoMap) {
                const columnInfo = columnPair.value;
                let column = new DataFileColumn();
                column.id = uuidv4();
                column.columnIndex = columnPair.key;
                column.electedHeaderName = columnInfo.electedHeaderName;
                column.electedType = columnInfo.electedType;
                column.columnPrettyName = columnInfo.electedHeaderName;

                theDatafile.tables[0].tableColumns.push(column);
                   
                if (columnInfo.skipHeader == 1) {
                    skipHeader = true;
                }
            }
            theDatafile.tables[0].electedDelimiter = delimeter;
            theDatafile.tables[0].strictQuote = strictQuoteValue;
            theDatafile.tables[0].sampleSize = sampleLines.length;
            theDatafile.tables[0].skipHeader = skipHeader;
            theDatafile.tables[0].tableName = tableName;
            theDatafile.tables[0].electedTableName = electedTableName;
            theDatafile.tables[0].numberOfLines = sampleLines.length;
            theDatafile.tables[0].analyzerStatus = 'complete';
            return this.dataFileProvider.findOneAndUpdate({ id: theDatafile.id }, 
                theDatafile
            , { new: true }).exec().catch(
                (error) => {
                    throw error;
                }
            );
        } catch (error) {
            throw error;
        }

    }

    async analyzeExcel(theDatafile: DatasetDataFileObject): Promise<any> {
        return new Workbook(this.clueDFSService, this.dataFileProvider).handleWorkbook(theDatafile).catch(
            async (error) => {
                console.log('analyzeExcel : ' + JSON.stringify(error));
                await this.dataFileProvider.findOneAndUpdate({ id: theDatafile.id }, { analyzerStatus: 'failed', errorMessage: JSON.stringify(error)  },
                    { new: true  ,safe: true , upsert: true}
                    ).exec();
                throw error;
            }
        );
    }

    async importFile(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, dfsFileUrl: string, clueSetting: ClueSettings, theDatafile: DatasetDataFileObject , tableIndex): Promise<any> {
        // CSV only, for excel, we might need a for loop over tables here ( or this function to be called by table id) 
        let importStatement = 'IMPORT TABLE ';
        importStatement += theDatafile.tables[tableIndex].electedTableName + ' ';
        importStatement += '(';
        for (const columnInfo of theDatafile.tables[tableIndex].tableColumns) {
            importStatement += columnInfo.electedHeaderName;
            importStatement += ' ';
            if (columnInfo.electedType == 'Number') {
                importStatement += 'numeric'
            } else {
                importStatement += columnInfo.electedType;
            }

            if (columnInfo.electedType == 'Number') {
                importStatement += ' NULL'
            }
            importStatement += ', '
        }
        importStatement = importStatement.substr(0, importStatement.length - 2);
        importStatement += ') ';
        importStatement += ' CSV DATA ('
        importStatement += '\'' + dfsFileUrl + '\'';
        importStatement += ') ';
        importStatement += 'WITH delimiter = ';
        importStatement += '\'' + theDatafile.tables[tableIndex].electedDelimiter + '\'';
        if (theDatafile.tables[tableIndex].skipHeader) {
            importStatement += ' , ';
            importStatement += 'skip = \'1\''
        }
        importStatement += ' , ';
        importStatement += 'nullif = \'\'';

       // importStatement += theDatafile.tables[tableIndex].strictQuote;
       // importStatement += ' , ';
        //importStatement += 'experimental_save_rejected = ON ';

        importStatement += ' ;';

        const tenantDBUserName = 'user' + tenantDatasetDatabaseObject.tenantDatabaseName.substr(tenantDatasetDatabaseObject.tenantDatabaseName.indexOf('_'), tenantDatasetDatabaseObject.tenantDatabaseName.length);
        const config = {
            user: 'root',
            host: datasetConfig.clueDataStore.host,
            database: tenantDatasetDatabaseObject.tenantDatabaseName,
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: clueSetting.datasetDatabaseCACert,
                key: clueSetting.datasetDatabaseRootUserKey,
                cert: clueSetting.datasetDatabaseRootUserCert
            }
        }
        var pool = new pg.Pool(config);
        const client = await pool.connect();

        console.log('Import statement:  ' + importStatement);
        await client.query('DROP TABLE IF EXISTS ' + theDatafile.tables[tableIndex].electedTableName + ';')
        return client.query(importStatement).then((theImportResult) => {
            if (theImportResult && theImportResult.rows) {
                console.log('Import result:  ' + JSON.stringify(theImportResult));

                const importOutput = theImportResult.rows[0];
                return JSON.stringify({ jobId: importOutput.job_id, status: importOutput.status, rows: importOutput.rows });
            }
        }).catch(
            (error) => {
                console.log('Importing error: ' + error);
                throw error;
            }
        )
            .finally(() => {
                client.release(true);
                pool.end();
            });;


    }

    async dropDatafileTable(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, clueSetting: ClueSettings, theDatafile: DatasetDataFileObject, tableIndex): Promise<any> {
        const tenantDBUserName = 'user' + tenantDatasetDatabaseObject.tenantDatabaseName.substr(tenantDatasetDatabaseObject.tenantDatabaseName.indexOf('_'), tenantDatasetDatabaseObject.tenantDatabaseName.length);
        const config = {
            user: tenantDBUserName,
            host: datasetConfig.clueDataStore.host,
            database: tenantDatasetDatabaseObject.tenantDatabaseName,
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: clueSetting.datasetDatabaseCACert,
                key: clueSetting.datasetDatabaseRootUserKey,
                cert: clueSetting.datasetDatabaseRootUserCert
            }
        }
        var pool = new pg.Pool(config);
        const client = await pool.connect();
        
        return client.query('DROP TABLE IF EXISTS ' + theDatafile.tables[tableIndex].electedTableName + ';').then(
                (theDropResult) => {
                    return { status: 0, data: theDropResult };
                }
        ).finally(() => {
            client.release(true);
            pool.end();
        });;
    }

    async dropDatabase(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, clueSetting: ClueSettings): Promise<any> {
        const config = {
            user: 'root',
            host: datasetConfig.clueDataStore.host,
            database: tenantDatasetDatabaseObject.tenantDatabaseName,
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: clueSetting.datasetDatabaseCACert,
                key: clueSetting.datasetDatabaseRootUserKey,
                cert: clueSetting.datasetDatabaseRootUserCert
            }
        }
        var pool = new pg.Pool(config);
        const client = await pool.connect();
        return client.queryclient.query('drop database if exists ' + tenantDatasetDatabaseObject.tenantDatabaseName + ' cascade').then(
            (theDropResult) => {
                return { status: 0, data: theDropResult };
            }
        ).finally(() => {
            client.release(true);
            pool.end();
        });;
    }

    async getDatabaseSize(tenantDatasetDatabaseObject: TenantDatasetDatabaseObject, clueSetting: ClueSettings): Promise<any> {
        const config = {
            user: 'root',
            host: datasetConfig.clueDataStore.host,
            database: tenantDatasetDatabaseObject.tenantDatabaseName,
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: clueSetting.datasetDatabaseCACert,
                key: clueSetting.datasetDatabaseRootUserKey,
                cert: clueSetting.datasetDatabaseRootUserCert
            }
        }
        var pool = new pg.Pool(config);
        const client = await pool.connect();
        return client.query('SELECT * FROM [SHOW RANGES FROM database ' +tenantDatasetDatabaseObject.tenantDatabaseName+ ']').then(
            (rangeResult) => {
                let sizeInMb = 0;
                for (const row of rangeResult.rows) {
                    sizeInMb += +row.range_size_mb;
                }
                sizeInMb = Math.round((sizeInMb + Number.EPSILON) * 100) / 100
                console.log('DB total Size: ' + sizeInMb);

                return sizeInMb;
            }
        ).finally(() => {
            client.release(true);
            pool.end();
        });;
    }

    async createTenantDatabase(clueSetting: ClueSettings, originalTenantId: string, originalUserId: string): Promise<any> {

        const config = {
            user: 'root',
            host: datasetConfig.clueDataStore.host,
            database: 'datasets',
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: clueSetting.datasetDatabaseCACert,
                key: clueSetting.datasetDatabaseRootUserKey,
                cert: clueSetting.datasetDatabaseRootUserCert
            }
        }


        const uniquId = originalTenantId.substr(0, originalTenantId.indexOf('-'));
        const userId = 'user_' + uniquId;
        const dbId = 'db_' + uniquId;
        var pool = new pg.Pool(config);
        const client = await pool.connect();

        await client.query('drop database if exists ' + dbId + ' cascade');
        await client.query('CREATE DATABASE ' + dbId + ' ENCODING = \'UTF-8\'');
        await client.query('CREATE USER IF NOT EXISTS ' + userId);
        await client.query('GRANT ALL ON DATABASE ' + dbId + ' TO ' + userId);
        await client.query('GRANT ALL ON DATABASE ' + dbId + ' TO dsuser');

        await client.release(true);

        pool.end();


        const baseDirectory = shell.pwd();
        const certificateDirectory = baseDirectory + '/cert/';
        const caKeyFile = certificateDirectory + 'ca.key';
        const caCertificateFile = certificateDirectory + 'ca.crt';
        const tenantCrtFile = certificateDirectory + 'client.' + userId + '.crt';
        const tenantKeyFile = certificateDirectory + 'client.' + userId + '.key';
        shell.exec('mkdir -p ' + certificateDirectory);

        const certificates: any[] = shell.ls('-l', caCertificateFile);

        if (certificates && certificates.length !== 0) {
        } else {
            const result = shell.exec('echo \"' + clueSetting.datasetDatabaseCACert + " \" | tee " + caCertificateFile);
        }

        const cakey: any[] = shell.ls('-l', caKeyFile);
        if (cakey && cakey.length !== 0) {
        } else {
            shell.exec('echo \"' + clueSetting.datasetDatabaseCA + " \" | tee " + caKeyFile);
        }

        //shell.mkdir('-p', tenantCertDir);

        const osType = os.platform();
        let createCertCommand = baseDirectory;
        createCertCommand += '/linux/';

        createCertCommand += 'cockroach cert create-client ';
        createCertCommand += userId + ' ';
        createCertCommand += '--certs-dir=' + certificateDirectory + ' ';
        createCertCommand += '--ca-key=' + caKeyFile;

        shell.exec(createCertCommand);

        const clientCrt = fs.readFileSync(tenantCrtFile);
        const clientKey = fs.readFileSync(tenantKeyFile);

        shell.rm('-f', tenantKeyFile);
        shell.rm('-f', tenantCrtFile);

        const tenantDatasetObject = new TenantDatasetDatabaseObject();
        tenantDatasetObject.id = uuidv4();
        tenantDatasetObject.tenantId = originalTenantId;
        tenantDatasetObject.tenantCert = String(clientCrt);
        tenantDatasetObject.tenantKey = String(clientKey);
        tenantDatasetObject.tenantDatabaseName = dbId;
        return this.tenantDatasetDatabaseProvider.create(tenantDatasetObject).then((createdTenantDatasetObject) => {
            
            return { status: 0, data: createdTenantDatasetObject };
        });

    }


    async connectToCockroach(userName: string, databaseName: string, datasetDatabaseCA: string, datasetDatabaseUserKey: string, datasetDatabaseUserCert: string): Promise<any> {
        const config = {
            user: userName,
            host: datasetConfig.clueDataStore.host,
            database: databaseName,
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: datasetDatabaseCA,
                key: datasetDatabaseUserKey,
                cert: datasetDatabaseUserCert
            }
        }
        var pool = new pg.Pool(config);
        return await pool.connect();
    }




}
