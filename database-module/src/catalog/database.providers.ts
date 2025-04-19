import { Connection } from 'mongoose';
import {
  TenantSchema, UserSchema, NodeSchema, InvitationSchema, DataSourceConnectionSchema,
  TaskSchema, ClueModelSchema, ClueModelObjectSchema, MetadataImportTaskTrackerSchema, SubscriptionPlanSchema,
  VisualizationBookSchema, VisualizationPageSchema, DatasetSchema, TenantDatasetDatabaseSchema, ClueSettingsSchema ,
  DatasetDataFileSchema
} from '../database.schemas';

export const CatalogProvider = [
  {
    provide: 'tenantProvider',
    useFactory: (connection: Connection) => {
      return connection.model('Tenant', TenantSchema);
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'userProvider',
    useFactory: (connection: Connection) => {
      return connection.model('User', UserSchema);
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'nodeProvider',
    useFactory: (connection: Connection) => {
      return connection.model('Node', NodeSchema);
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'invitationProvider',
    useFactory: (connection: Connection) => {
      return connection.model('Invitation', InvitationSchema);
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'datasourceConnectionProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'DataSourceConnection',
        DataSourceConnectionSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'taskProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'Task',
        TaskSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'modelProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'ClueModel',
        ClueModelSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'modelObjectProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'ClueModelObject',
        ClueModelObjectSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'visualizationBookProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'VisualizationBook',
        VisualizationBookSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'visualizationPageProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'VisualizationPage',
        VisualizationPageSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'metadataTrackerProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'MetadataImportTaskTracker',
        MetadataImportTaskTrackerSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'subscriptionPlanProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'SubscriptionPlan',
        SubscriptionPlanSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'datasetProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'Dataset',
        DatasetSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'TenantDatasetDatabaseProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'TenantDatasetDatabase',
        TenantDatasetDatabaseSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'ClueSettingsProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'ClueSettings',
        ClueSettingsSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'datasetDataFileProvider',
    useFactory: (connection: Connection) => {
      return connection.model(
        'DatasetDataFile',
        DatasetDataFileSchema,
      );
    },
    inject: ['DATABASE_CONNECTION'],
  }
];
