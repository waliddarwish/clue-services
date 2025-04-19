import { Module, HttpModule } from '@nestjs/common';
import { AppModule } from '../../app-module/src/app.module';
import { AuthenticationModule } from '../../authentication-module/src/authentication.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';
import { MetadataImporterController } from './metadata-importer.controller';
import { MetadataImporterService } from './metadata-importer.service';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';

@Module({
  imports: [HttpModule, AuthenticationModule, DatabaseModule],
  controllers: [MetadataImporterController],
  providers: [MetadataImporterService,
    ...CatalogProvider,
    ...databaseProviders,
    AuthenticationService,
    LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class MetadataImporter extends AppModule { }
 