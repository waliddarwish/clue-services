import { Module, HttpModule } from '@nestjs/common';
import { AppModule } from '../../app-module/src/app.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';
import { DatasetCtrlService } from './dataset-ctrl.service';
import { DatasetCrtlController } from './dataset-ctrl.controller';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';
import { ClueDFSModule } from '../../clue-dfs-module/src/clue-dfs.module';
import { ClueDFSService } from '../../clue-dfs-module/src/clue-dfs.service';


@Module({
  imports: [HttpModule, DatabaseModule , ClueDFSModule],
  controllers: [DatasetCrtlController],
  providers: [DatasetCtrlService, ClueDFSService,
    ...CatalogProvider,
    ...databaseProviders,
    LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class DatasetCtrlModule extends AppModule {}
