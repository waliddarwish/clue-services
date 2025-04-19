import { Injectable, Inject } from '@nestjs/common';
import { DataSourceConnection, ClueModel, MetadataImportTaskTracker, DatasetDataFile, ClueModelObject } from '../../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { MetadataCoordinationService } from '../../../metadata-coordination-module/src/metadata-coordination.service';
import { MetadataImportTaskTrackerObject } from '../../../object-schema/src/schemas/catalog.metadata-import-task-tracker';
import { ImportSpecObject } from '../../../object-schema/src/schemas/rbc.import-spec';
import uuidv4 = require('uuid/v4');
import { ClueModelObjectEntry } from '../../../object-schema/src/schemas/catalog.model-object';



@Injectable()
export class MetadataService {
  
  constructor(@Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
              @Inject('modelProvider') private readonly modelProvider: Model<ClueModel>,
              @Inject('datasetDataFileProvider') private readonly datasetDataFileProvider: Model<DatasetDataFile>,
              @Inject('metadataTrackerProvider') private readonly metadataTrackerProvider: Model<MetadataImportTaskTracker>,
              @Inject('modelObjectProvider') private readonly modelObjectProvider: Model<ClueModelObject>,
              private readonly metadataCoordinationService: MetadataCoordinationService) { }

  async getDatabaseObjects(connectionId: any, datasourceType: string, schemaName: any, theTenantId: string): Promise<any> {
    if (datasourceType === 'Dataset') {
      return this.datasetDataFileProvider.aggregate().match({
        datasetId : connectionId
      }).project( { 
        "id" : '$id',
        "object_name": { $concat: [ "$fileName", " - ", "$prettyName" ] },
        "object_type": 'Data File'
      }
      ).exec().then(result=> {
        return { data: result};
      });
    } else {
      return this.dsConnectionModel.findOne({ id: connectionId, tenantId: theTenantId }).exec().then((result) => {
        if (result) {
          return this.metadataCoordinationService.getSchemaObjects(result, schemaName);
        } else {
          throw new Error('Connection not found');
        }
      });
    }
  }

  async importMetadata(modelId: any, importSpecs: ImportSpecObject[], datasourceMap: any , theTenantId: string , theUserId: string): Promise<any> {
    
    return this.modelProvider.findOne({ id: modelId, tenantId: theTenantId }).exec().then( async (result) => {
      if (result) {
        const trackingId = uuidv4();

        for (const importSpec of importSpecs) {
          

            for (const object of importSpec.objects) {
              const tracker: MetadataImportTaskTrackerObject = new MetadataImportTaskTrackerObject();
              tracker.id = uuidv4();
              tracker.trackingId = trackingId;
              tracker.clueModelId = result.id;
              tracker.tenantId = theTenantId;
              tracker.userId = theUserId;
              tracker.schemata = object.objectName.split('.')[0];
              tracker.objectName = object.objectName;
              tracker.dataSourceConnectionId = importSpec.connectionId;
              tracker.importTimestamp = null;
              tracker.status = 'Pending';
              tracker.errorMessage = null;
              const createdTracker = new this.metadataTrackerProvider(tracker);
              await createdTracker.save();

            }

            if (datasourceMap[importSpec.connectionId] === 'Dataset') { 
              for (const object of importSpec.objects) {
                try { 
                  await this.metadataTrackerProvider.update({ trackingId , dataSourceConnectionId : importSpec.connectionId , objectName: object.objectName }
                    , {status : 'In Progress'}).exec();
                  const defaultModelObject = await this.modelObjectProvider.findOne({datasetDatafileId: object.objectId}).exec();
                  let modelObject: ClueModelObjectEntry = new ClueModelObjectEntry();
                  modelObject.id = uuidv4();
                  modelObject.name = defaultModelObject.name;
                  modelObject.nameInDatasource = defaultModelObject.nameInDatasource ;
                  modelObject.userId = defaultModelObject.userId;
                  modelObject.tenantId = defaultModelObject.tenantId ;
                  modelObject.dataSourceConnectionId = defaultModelObject.dataSourceConnectionId;
                  modelObject.type = defaultModelObject.type;
                  modelObject.source = defaultModelObject.source ;
                  modelObject.schemata = defaultModelObject.schemata;
                  modelObject.clueModelId =  modelId;
                  modelObject.datasetDatafileId = defaultModelObject.datasetDatafileId;
                  modelObject.modelObjectItems = defaultModelObject.modelObjectItems.map(modelObjectItem => {
                    modelObjectItem.modelObjectItemId = uuidv4();
                    return modelObjectItem;
                  });
                  const newModelObject = new this.modelObjectProvider(modelObject);
                  await newModelObject.save();
                  this.metadataTrackerProvider.update({ trackingId , dataSourceConnectionId : importSpec.connectionId , objectName: object.objectName }
                    , {status : 'Successful'}).exec();
                } catch(error)  {
                  this.metadataTrackerProvider.update({ trackingId , dataSourceConnectionId : importSpec.connectionId , objectName: object.objectName }
                    , {status : 'Error' , errorMessage: JSON.stringify(error)}).exec();
                };
              }
            } else { 
              this.metadataCoordinationService.importModel(result, importSpecs, theTenantId, theUserId, trackingId);
            }
        }
        return { trackingId};
      } else {
        throw new Error('Model not found ' + modelId);
      }
    });
  }

  async getSchemas(connectionId: any, theTenantId: string): Promise<any> {
    return this.dsConnectionModel.findOne({ id: connectionId, tenantId: theTenantId }).exec().then((result) => {
      if (result) {
        return this.metadataCoordinationService.getSchemas(result);
      } else {
        throw new Error('Connection not found');
      }
    });
  }

  async importStatus(theTrackingId: any): Promise<any> {
    return this.metadataTrackerProvider.find({ trackingId: theTrackingId});
  }

  async importStatusByModel(theModelId: any): Promise<any> {
    return this.metadataTrackerProvider.find({ clueModelId: theModelId});
  }

  async collectiveStatus(theModelId: any): Promise<any> {
    return this.metadataTrackerProvider.aggregate(
      [
        {
          $match:  { clueModelId: theModelId}
        } ,
        { $group: { _id : "$status"   , Count: { $sum: 1 } } },
      ]
    ).exec();
  }
}
