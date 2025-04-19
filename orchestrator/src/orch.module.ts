import { Module, HttpModule, HttpService, OnModuleInit } from '@nestjs/common';

import { SecurityService } from './security/security.service';
import { CatalogModule } from '../../catalog-module/src/catalog.module';
import { OrchController } from './orch.controller';
import { CatalogController } from '../../catalog-module/src/catalog/catalog.controller';
import { CatalogService } from '../../catalog-module/src/catalog/catalog.service';
import { OrchService } from './orch.service';
import { SwaggerModule } from '@nestjs/swagger';
import { LogModule } from '../../log-module/src/log.module';
import { LogService } from '../../log-module/src/log.service';
import { AuthenticationModule } from '../../authentication-module/src/authentication.module';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { GlobalizationService } from '../../globalization-module/src/globalization.service';
import { GlobalizationModule } from '../../globalization-module/src/globalization.module';
import { SecurityController } from './security/security.controller';
import { AppMailService } from '../../mail-module/src/mail.service';
import { ConnectionController } from '../../catalog-module/src/connections/connection.controller';
import { DataSourceConnectionService } from '../../catalog-module/src/connections/connection.service';
import { InvitationService } from '../../catalog-module/src/invitations/invitation.service';
import { InvitationController } from '../../catalog-module/src/invitations/invitation.controller';
import { ConnectionTestModule } from '../../connection-test-module/src/connection-test.module';
import { ConnectionTestService } from '../../connection-test-module/src/connection-test.service';
import { SchedulerModule } from '../../scheduler-module/src/scheduler.module';
import { SchedulerService } from '../../scheduler-module/src/scheduler.service';
import { TaskController } from './tasks/task.controller';
import { TaskService } from './tasks/task.service';
import { SearchService } from '../../catalog-module/src/searching/search.service';
import { SearchController } from '../../catalog-module/src/searching/search.controller';
import { MetadataController } from '../../catalog-module/src/metadata/metadata.controller';
import { MetadataService } from '../../catalog-module/src/metadata/metadata.service';
import { MetadataCoordinationService } from '../../metadata-coordination-module/src/metadata-coordination.service';
import { ClueModelController } from '../../catalog-module/src/Model/model.controller';
import { ClueModelService } from '../../catalog-module/src/Model/model.service';
import { VisualizationBookController } from '../../catalog-module/src/Visualizations/visualization-book.controller';
import { VisualizationPageController } from '../../catalog-module/src/Visualizations/visualization-page.controller';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';
import { QueryGeneratorModule } from '../../query-generator-module/src/query-generator.module';
import { QueryExecutorModule } from '../../query-executor-module/src/query-executor.module';
import { QueryGeneratorService } from '../../query-generator-module/src/query-generator.service';
import { QueryExecutorService } from '../../query-executor-module/src/query-executor.service';
import { SubscriptionPlanController } from '../../catalog-module/src/subscription-plan/subscription-plan.controller';
import { SubscriptionPlanService } from '../../catalog-module/src/subscription-plan/subscription-plan.service';
import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';
import { DatasetController } from '../../catalog-module/src/datasets/dataset.controller';
import { ClueDFSModule } from '../../clue-dfs-module/src/clue-dfs.module';
import { ClueDFSService } from '../../clue-dfs-module/src/clue-dfs.service';
import { DatasetCDBService } from '../../datasets-controller-module/src/dataset.service';
import { DatasetCDBModule } from '../../datasets-controller-module/src/datasets.module';
import { DatasourceController } from '../../catalog-module/src/datasource/datasource.controller';
import { DatasetService } from '../../catalog-module/src/datasets/dataset.service';
import { VisualizationBookService } from '../../catalog-module/src/Visualizations/visualization-book.service';
import { VisualizationPageService } from '../../catalog-module/src/Visualizations/visualization-page.service';
import { DatasourceService } from '../../catalog-module/src/datasource/datasource.service';
import { DocumentController } from '../../catalog-module/src/documents/document-controller';
import { DocumentService } from '../../document-retrieving-module/src/document.service';
@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    CatalogModule,
    SwaggerModule,
    LogModule,
    AuthenticationModule,
    GlobalizationModule,
    ConnectionTestModule,
    SchedulerModule,
    QueryGeneratorModule,
    QueryExecutorModule,
    ClueDFSModule,
    DatasetCDBModule,
  ],
  controllers: [
    OrchController,
    CatalogController,
    SecurityController,
    ConnectionController,
    InvitationController,
    TaskController,
    SearchController,
    MetadataController,
    ClueModelController,
    SubscriptionPlanController,
    QueryController,
    DatasetController,
    VisualizationBookController,
    VisualizationPageController,
    DatasourceController,
    DocumentController,
  ],
  providers: [
    CatalogService,
    ...CatalogProvider,
    ...databaseProviders,
    SecurityService,
    OrchService,
    LogService,
    AuthenticationService,
    GlobalizationService,
    AppMailService,
    DataSourceConnectionService,
    InvitationService,
    ConnectionTestService,
    SchedulerService,
    TaskService,
    SearchService,
    MetadataService,
    MetadataCoordinationService,
    ClueModelService,
    QueryGeneratorService,
    QueryExecutorService,
    SubscriptionPlanService,
    QueryService,
    ClueDFSService,
    DatasetCDBService,
    DatasetService,
    VisualizationBookService,
    VisualizationPageService,
    DatasourceService,
    DocumentService,
  ],
})
export class OrchModule { 
  
}
