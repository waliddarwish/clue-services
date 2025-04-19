import { Module, HttpModule } from '@nestjs/common';
import { AppModule } from '../../app-module/src/app.module';
import { AuthenticationModule } from '../../authentication-module/src/authentication.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';
import { MetadataCoordinatorController } from './metadata-coordinator.controller';
import { MetadataCoordinatorService } from './metadata-coordinator.service';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';
import { MetadataImportingModule } from '../../metadata-importing-module/src/metadata-importing.module';
import { MetadataImportingService } from '../../metadata-importing-module/src/metadata-importing.service';
import { ConnectionTrackerModule } from '../../connection-tracking-module/src/connection-tracking.module';
import { ConnectionTrackerService } from '../../connection-tracking-module/src/connection-tracking.service';


@Module({
  imports: [HttpModule, AuthenticationModule, DatabaseModule, MetadataImportingModule, ConnectionTrackerModule],
  controllers: [MetadataCoordinatorController],
  providers: [MetadataCoordinatorService, AuthenticationService, MetadataImportingService,
    ...CatalogProvider,
    ...databaseProviders,
    ConnectionTrackerService,
   LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class MetadataCoordinator extends AppModule { }
