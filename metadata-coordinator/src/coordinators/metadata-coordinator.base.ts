import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { MetadataImportingService } from '../../../metadata-importing-module/src/metadata-importing.service';
import { DataSourceConnectionObject } from '../../../object-schema/src/schemas/catalog.connection';
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { Model } from 'mongoose';
import { MetadataImportTaskTracker } from '../../../database-module/src/database.schemas';

export class AbstractMetadataCoordinator {



    protected connection: DataSourceConnectionObject;
    protected authenticationService: AuthenticationService;
    protected metadataImportingService: MetadataImportingService;
    protected connectionTrackerService: ConnectionTrackerService;
    protected metadataTrackerProvider: Model<MetadataImportTaskTracker>;

    constructor(connection, theAuthService, theMetadataImportingService?, theConnectionTrackerService?,
                theMetadataTrackerProvider?) {
        this.connection = connection;
        this.authenticationService = theAuthService;
        this.metadataImportingService = theMetadataImportingService;
        this.connectionTrackerService = theConnectionTrackerService;
        this.metadataTrackerProvider = theMetadataTrackerProvider;

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

    public async getSchemas(): Promise<any> {
        return this.decryptPassword().then(() => {
            return this.getSchemaInternal();
        });
    }
    protected async getSchemaInternal(): Promise<any> {
        // base function does nothing

    }


    async getSchemaObjects(schemaName: any): Promise<any> {
        return this.decryptPassword().then(() => {
            return this.getSchemaObjectsInternal(schemaName);
        });
    }

    protected async getSchemaObjectsInternal(schemaName: any): Promise<any> {
        // base function does nothing

    }

    public async importConnectionMetadata(model: any, importSpec: any, userId: string, tenantId: string,
                                          theTrackerId: string): Promise<any> {
        
        let acquiredCount = await this.connectionTrackerService.acquireMetadataConnections(this.connection.id, this.connection.metadataConcurrency);

        if (acquiredCount > 0) {
            const divValue = importSpec.objects.length / this.connection.metadataConcurrency;
            const reminderValue = importSpec.objects.length % this.connection.metadataConcurrency;
            const segmentSize: number = divValue;
            const lastSegmentSize = divValue + reminderValue;

            for (let i = 0; i < this.connection.metadataConcurrency; i++) {
                let currentSegmentSize = segmentSize;
                if (i === this.connection.metadataConcurrency - 1) {
                    currentSegmentSize = lastSegmentSize;
                }
                const segment = importSpec.objects.slice(i * currentSegmentSize, (i + 1) * currentSegmentSize);
                await this.metadataImportingService.importObjects(tenantId, userId, model.id, theTrackerId, segment, this.connection).finally(
                    async () => {
                    await this.connectionTrackerService.releaseMetadataConnections(this.connection.id, 1);
                    });
            }
        } else {
            this.metadataTrackerProvider.updateMany({ trackingId: theTrackerId, dataSourceConnectionId: this.connection.id },
                {
                    status: 'Error',
                    errorMessage: 'Unable to acquire enough connections to import the model with current metadata concurrency setting',
                }).exec();
        }

    }


}
