import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { ClueModelObject, MetadataImportTaskTracker } from '../../../database-module/src/database.schemas';
import { Model } from 'mongoose';


export abstract class AbstractMetadataImporter {

  protected connection: any;
  protected authenticationService: AuthenticationService;
  protected modelObjectProvider: Model<ClueModelObject>;
  protected metadataTrackerProvider: Model<MetadataImportTaskTracker>;





  constructor(connection, theAuthService, theModelObjectProvider?, theMetatdataTrackerProvider?) {
    this.connection = connection;
    this.authenticationService = theAuthService;
    this.modelObjectProvider = theModelObjectProvider;
    this.metadataTrackerProvider = theMetatdataTrackerProvider;

    }

  protected async decryptPassword(): Promise<any> {
    return this.authenticationService.decryptPassword(this.connection.connectionInfo.password).then((result) => {
      if (result.status === 0) {
        this.connection.connectionInfo.password = result.data;
        return this.connection;
      } else {
        throw new Error('Unable to resolve provided password');
      }
    });
  }
  async importObject(modelId: any, objects: string[], userId: any, tenantId: any, trackerId: any): Promise<any> {
    return this.decryptPassword().then((result) => {
      const currentTime = new Date().getTime();
      return this.metadataTrackerProvider.updateOne({ id: trackerId }, { startTimestamp: currentTime, status: 'In Progress' }).exec().then(() => {
          return this.importObjectInternal(modelId, objects, userId, tenantId, trackerId);
        });
      });
  }
  protected abstract async importObjectInternal(modelId, objects, userId,
                                                tenantId, trackerId): Promise<any>;


  protected async saveEntry(entry: any, trackerId: any, objectName) {
    const createdEntry = new this.modelObjectProvider(entry);
    await createdEntry.save().then( async () => {
      await this.metadataTrackerProvider.updateOne({
        trackingId: trackerId, objectName }, {
        importTimestamp: new Date().getTime(),
        status: 'Successful',
      }).exec().then(() => console.log('Successful ' + objectName)).catch(error=> { console.log('Error ' + objectName + ' ' + JSON.stringify(error) )});
    });
  }


 }