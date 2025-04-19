import { Module, HttpModule } from '@nestjs/common';
import { CatalogService } from './catalog/catalog.service';
import { GlobalizationService } from '../../globalization-module/src/globalization.service';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { AppMailService } from '../../mail-module/src/mail.service';
import { DataSourceConnectionService } from './connections/connection.service';
import { ConnectionTestService } from '../../connection-test-module/src/connection-test.service';
import { MetadataCoordinationService } from '../../metadata-coordination-module/src/metadata-coordination.service';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';
import { StripeModule } from 'nestjs-stripe';
import { DocumentModule } from '../../document-retrieving-module/src/document-retrieving.module' 
import { DocumentService } from '../../document-retrieving-module/src/document.service';

@Module({
  imports: [
    StripeModule.forRoot({
      apiKey: 'sk_test_NNRapRH0UqsnPpG3Eyjrl5bK004EVdFVwR',
    }),
    HttpModule, DatabaseModule , DocumentModule],
  controllers: [],
  providers: [CatalogService,
    ...CatalogProvider,
    ...databaseProviders,
    GlobalizationService,
    AuthenticationService,
    AppMailService,
    DataSourceConnectionService,
    ConnectionTestService,
    MetadataCoordinationService,
    DocumentService
  ],
})
export class CatalogModule {

}
