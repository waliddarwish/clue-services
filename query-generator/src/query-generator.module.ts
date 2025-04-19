import { QueryGeneratorController } from './query-generator.controller';
import { QueryGeneratorService } from './query-generator.service';
import { Module, HttpModule } from '@nestjs/common';
import { AppModule } from '../../app-module/src/app.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';


@Module({
  imports: [HttpModule, DatabaseModule],
  controllers: [QueryGeneratorController],
  providers: [QueryGeneratorService,
    ...CatalogProvider,
    ...databaseProviders,
    LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class QueryGeneratorModule extends AppModule { }