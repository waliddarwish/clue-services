import { AbstractQueryExecutor } from './executor.base';
var pg = require('pg');
import datasetConfig = require('../../config/config.json');


export class CockroachQueryExecutorImpl extends AbstractQueryExecutor {



    protected async executeQueryInternal(): Promise<any> {
        let dataset = this.executorState.datasets[0];
        let clueSettings = await this.clueSettingsProvider.findOne({ id: '87f6a749-3e7f-4bb4-98cd-331fb4eac8f1' }).exec();
        let tenantDatabaseDataset = await this.tenantDatasetDatabaseProvider.findOne({ tenantId: dataset.tenantId }).exec();
        const tenantDBUserName = 'user' + tenantDatabaseDataset.tenantDatabaseName.substr(tenantDatabaseDataset.tenantDatabaseName.indexOf('_'), tenantDatabaseDataset.tenantDatabaseName.length);

        // TODO Using ROOT for DEMO as we are having issues with certs
        const config = {
            user: 'root',
            host: datasetConfig.clueDataStore.host,
            database: tenantDatabaseDataset.tenantDatabaseName,
            port: datasetConfig.clueDataStore.port,
            ssl: {
                ca: clueSettings.datasetDatabaseCACert,
                key: clueSettings.datasetDatabaseRootUserKey,
                cert: clueSettings.datasetDatabaseRootUserCert
            }
        }
        var pool = new pg.Pool(config);

	    const client = await pool.connect();

        return client.query(this.executorState.queryFromGenerator.toLocaleLowerCase()).then((res) => {
            return { status: 0, data: res.rows };
        }
        ).catch((err) => {
            console.log("Error: " + JSON.stringify(err));
            return { status: -1, data: err };
        }).finally(() => {
            client.end();
        });
    }
}
