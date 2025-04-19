import { Module } from '@nestjs/common';
import { CatalogProvider } from './catalog/database.providers';
import { databaseProviders } from './catalog/database.database';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ...CatalogProvider,
    ...databaseProviders,
  ],
})
export class DatabaseModule {

}
