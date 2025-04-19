import { Injectable, Inject } from '@nestjs/common';
import { AbstractMetadataImporter } from './importers/metadata-importer.base';
import metadataImporterFactory = require('./importers/metadata-importer.factory');
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { MetadataImportTaskTracker, ClueModelObject } from '../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { ClueModelEntry } from '../../object-schema/src/schemas/catalog.model';

@Injectable()
export class MetadataImporterService {

  constructor(private readonly authenticationService: AuthenticationService,
              @Inject('metadataTrackerProvider') private readonly metadataTrackerProvider: Model<MetadataImportTaskTracker>,
              @Inject('modelObjectProvider') private readonly modelObjectProvider: Model<ClueModelObject>) {
  }

  async importObject(tenantId: any, userId: any, trackerId: any, modelId: any, objects: string[], connection: any): Promise<any> {
    const importer: AbstractMetadataImporter = metadataImporterFactory.instantiateWithProviders(connection,
          this.authenticationService , this.modelObjectProvider, this.metadataTrackerProvider );
    if (importer) {
      return importer.importObject(modelId, objects, userId, tenantId, trackerId).catch((err) => {
        return this.metadataTrackerProvider.updateMany({ trackingId: trackerId, dataSourceConnectionId: connection.id }, {
          importTimestamp: new Date().getTime(),
          status: 'Error',
          errorMessage: err,
        }).exec();
      });
    } else {
      // update trackers with unsupported connection error. Should never happen
      return this.metadataTrackerProvider.updateOne({ id: trackerId }, {
        importTimestamp: new Date().getTime(),
        status: 'Error',
        errorMessage: 'Unsupported connection type ' + connection.connectionType,
      }).exec();
    }
  }
}
