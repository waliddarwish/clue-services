import { Module } from '@nestjs/common';
import { AppModule } from '../../app-module/src/app.module';
import { ConnectionTrackerService } from './connection-tracking.service';
import { DatabaseModule } from '../../database-module/src/database.module';
import { CatalogProvider } from '../../database-module/src/catalog/database.providers';
import { databaseProviders } from '../../database-module/src/catalog/database.database';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    ConnectionTrackerService,
    ...CatalogProvider,
    ...databaseProviders,
  ],
})
export class ConnectionTrackerModule extends AppModule {}
