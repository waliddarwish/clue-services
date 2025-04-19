
import { Module, HttpModule } from '@nestjs/common';
import { AppModule } from '../../app-module/src/app.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';
import { QueryExecutorController } from './query-executor.controller';
import { QueryExecutorService } from './query-executor.service';
import { AuthenticationModule } from '../../authentication-module/src/authentication.module';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { ConnectionTrackerModule } from '../../connection-tracking-module/src/connection-tracking.module';
import { ConnectionTrackerService } from '../../connection-tracking-module/src/connection-tracking.service';


@Module({
  imports: [HttpModule, AuthenticationModule, DatabaseModule, ConnectionTrackerModule],
  controllers: [QueryExecutorController],
  providers: [QueryExecutorService,
    ...CatalogProvider,
    ...databaseProviders,
    AuthenticationService,
    ConnectionTrackerService,
    LogService, {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }],
})
export class QueryExecutorModule extends AppModule { }
