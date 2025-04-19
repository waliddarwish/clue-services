import { Injectable } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';
import { QueryDefinition } from '../../object-schema/src/schemas/query-definition';
import { AbstractQueryExecutor } from './executors/executor.base';
import queryExecutorFactory = require('./executors/executor.factory');
import { ConnectionTrackerService } from '../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { DatasetObject } from '../../object-schema/src/schemas/catalog.dataset';
import { Inject } from '@nestjs/common';
import { TenantDatasetDatabase, ClueSettings } from '../../database-module/src/database.schemas';
import { Model } from 'mongoose';



@Injectable()
export class QueryExecutorService {
  constructor(
    @Inject('TenantDatasetDatabaseProvider') protected readonly tenantDatasetDatabaseProvider: Model<TenantDatasetDatabase>,
    @Inject('ClueSettingsProvider') protected readonly clueSettingsProvider: Model<ClueSettings>,
    private readonly connectionTrackerService: ConnectionTrackerService,
    private readonly authenticationService: AuthenticationService,
  ) {

  }

  executeQuery(queryString: any, connections: DataSourceConnectionObject[], queryDefinition: QueryDefinition, models: any[], datasets: DatasetObject[]): Promise<any> {

    const queryExecutor: AbstractQueryExecutor = queryExecutorFactory.instantiateExecutor(queryString, connections, queryDefinition, models,
      this.connectionTrackerService, this.authenticationService, datasets, this.tenantDatasetDatabaseProvider, this.clueSettingsProvider);
    if (queryExecutor) {
      console.log("Query-Executor: Service: executeQuery:  starting executor: ");
      return queryExecutor.executeQuery();
    } else {
      console.log("Query-Executor: Service: executeQuery:  Panic! Null executor");
      throw new Error("Error. Executor is null. Handle me!!!");
    }
  }

}
