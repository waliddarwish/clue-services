import { Injectable, Inject } from '@nestjs/common';
import metadataCoordinationFactory = require('./coordinators/metadata-coordinator.factory');
import { AbstractMetadataCoordinator } from './coordinators/metadata-coordinator.base';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { DataSourceConnection, MetadataImportTaskTracker } from '../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { MetadataImportingService } from '../../metadata-importing-module/src/metadata-importing.service';
import { ConnectionTrackerService } from '../../connection-tracking-module/src/connection-tracking.service';


@Injectable()
export class MetadataCoordinatorService {

  constructor(private readonly authenticationService: AuthenticationService,
              @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
              @Inject('metadataTrackerProvider') private readonly metadataTrackerProvider: Model<MetadataImportTaskTracker>,
              private readonly metadataImportingService: MetadataImportingService,
              private readonly connectionTrackerService: ConnectionTrackerService) {
  }

  async getSchemas(connection: any): Promise<any> {
    const coordinator: AbstractMetadataCoordinator = metadataCoordinationFactory.default(connection , this.authenticationService);
    if (coordinator) {
      return coordinator.getSchemas().catch((error) => {
        return { result: 'Internal Error', error };
      });
    } else {
      return { result: 'Unsupported Connection type' + connection.connectionType };
    }

  }

  async getSchemaObjects(connection: any, schemaName: any): Promise<any> {
    const coordinator: AbstractMetadataCoordinator = metadataCoordinationFactory.default(connection, this.authenticationService);
    if (coordinator) {
      return coordinator.getSchemaObjects(schemaName).catch((error) => {
        return { result: 'Internal Error', error };
      });
    } else {
      return { result: 'Unsupported Connection type' + connection.connectionType };
    }
  }

  async importModel(model: any, importSpecs: any , userId: string, tenantId: string , theTrackerId: string): Promise<any> {
    for (const importSpec of importSpecs) {
      this.dsConnectionModel.findOne( {id: importSpec.connectionId , tenantId}).exec().then((connection) => {
        if (connection) {
          const coordinator: AbstractMetadataCoordinator = 
            metadataCoordinationFactory.instantiateCoordinatorWithImportingService(connection, this.authenticationService,
              this.metadataImportingService , this.connectionTrackerService, this.metadataTrackerProvider);
          if (coordinator) {
            coordinator.importConnectionMetadata(model, importSpec, userId, tenantId, theTrackerId);
          } else  {
            // update trackers with unsupported connection error. Should never happen
            this.metadataTrackerProvider.updateMany({ trackingId: theTrackerId, dataSourceConnectionId: connection.id} , {
              importTimestamp : new Date().getTime(),
              status : 'Error',
              errorMessage : 'Unsupported connection type ' + connection.connectionType }).exec();
          }
        } else {
          this.metadataTrackerProvider.updateMany({ trackingId: theTrackerId, dataSourceConnectionId: importSpec.connectionId },
            {
              status: 'Error',
              errorMessage: 'Unknown data source connection',
            }).exec();
        }

      }).catch((error) => {
        this.metadataTrackerProvider.updateMany({ trackingId: theTrackerId, dataSourceConnectionId: importSpec.connectionId },
          {
            status: 'Error',
            errorMessage: 'Internal error, please contact support. Data source connection not found.',
          }).exec();
      });
    }
    return {status: 'Success - All objects submitted for import'};
  }

}
