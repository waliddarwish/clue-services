import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  DataSourceConnection,
  Dataset,
  ClueSettings,
  SubscriptionPlan,
  Tenant,
} from '../../database-module/src/database.schemas';
import sleepAsync = require('sleep-async');

@Injectable()
export class ConnectionTrackerService {
  constructor(
    @Inject('datasourceConnectionProvider')
    private readonly dsConnectionModel: Model<DataSourceConnection>,
    @Inject('ClueSettingsProvider')
    private readonly clueSettingsModel: Model<ClueSettings>,
    @Inject('subscriptionPlanProvider')
    private readonly planModel: Model<SubscriptionPlan>,
    @Inject('tenantProvider')
    private readonly tenantModel: Model<SubscriptionPlan>,
  ) {}

  async acquireConnectionsInternal(
    connectionId: string,
    connectionCount: number,
    connectionCountField: string,
  ): Promise<number> {
    let connection;

    connection = await this.dsConnectionModel
      .findOne({ id: connectionId })
      .exec();
    if (connection !== null) {
      let retryCount = 0;
      while (retryCount < connection.maxAcquireConnectionRetry) {
        try {
          await this.dsConnectionModel
            .findOneAndUpdate(
              { id: connectionId },
              { $inc: { [connectionCountField]: connectionCount } },
            )
            .exec();
          return connectionCount;
        } catch (error) {
          retryCount++;
          await sleepAsync.sleep(connection.acquireConnectionSleepDuration);
        }
      }
      return 0;
    } else {
      throw 'Unable to find connection : ' + connectionId;
    }
  }
  async acquireConnections(
    connectionId: string,
    connectionCount: number,
  ): Promise<number> {
    return this.acquireConnectionsInternal(
      connectionId,
      connectionCount,
      'dataConnectionCount',
    );
  }

  async acquireMetadataConnections(
    connectionId: string,
    connectionCount: number,
  ): Promise<number> {
    return this.acquireConnectionsInternal(
      connectionId,
      connectionCount,
      'metadataConnectionCount',
    );
  }

  async releaseConnectionsInternal(
    connectionId: string,
    connectionCount: number,
    connectionCountField: string,
  ): Promise<number> {
    await this.dsConnectionModel
      .findOneAndUpdate(
        { id: connectionId },
        { $inc: { [connectionCountField]: -connectionCount } },
      )
      .exec();
    return connectionCount;
  }

  async releaseConnections(
    connectionId: any,
    connectionCount: number,
  ): Promise<number> {
    return this.releaseConnectionsInternal(
      connectionId,
      connectionCount,
      'dataConnectionCount',
    );
  }

  async releaseMetadataConnections(
    connectionId: string,
    connectionCount: number,
  ): Promise<number> {
    return this.releaseConnectionsInternal(
      connectionId,
      connectionCount,
      'metadataConnectionCount',
    );
  }

  async acquireDatasetStoreConnections(
    tenantId: string,
    connectionCount: number,
  ): Promise<number> {
    return this.acquireDatasetStoreConnectionsInternal(
      tenantId,
      connectionCount,
    );
  }

  async acquireDatasetStoreConnectionsInternal(
    tenantId: string,
    connectionCount: number,
  ): Promise<number> {
    let clueSettings: ClueSettings = await this.clueSettingsModel
      .findOne()
      .exec();

    let tenant: Tenant = await this.tenantModel
      .findOne({ id: tenantId })
      .exec();
    if (clueSettings.installationType === 'Multi-tenant' && tenant.name !== 'ClueAnalytics') {
      if (tenant !== null) {
        let tenantPlan: SubscriptionPlan = await this.planModel
          .findOne({ id: tenant.subscriptionPlan })
          .exec();
        if (tenantPlan !== null) {
          let concurreny = tenantPlan.concurrency;
          let retryCount = 0;
          tenant = null;
          while (
            retryCount < clueSettings.maxAcquireDatasetStoreConnectionRetry &&
            tenant === null
          ) {
            tenant = await this.tenantModel
              .findOneAndUpdate(
                {
                  id: tenantId,
                  dataConnectionCount: { $lte: concurreny - connectionCount },
                },
                {
                  $inc: { dataConnectionCount: connectionCount },
                },
              )
              .exec();
            if (tenant) {
              return connectionCount;
            } else {
              retryCount++;
              await sleepAsync.sleep(
                clueSettings.acquireDatasetStoreConnectionSleepDuration,
              );
            }
          }
          return 0;
        }
      }
      return 0;
    } else {
      return connectionCount;
    }
  }

  async releaseDatasetStoreConnections(
    tenantId: string,
    connectionCount: number,
  ): Promise<number> {
    return this.releaseDatasetStoreConnectionsInternal(
      tenantId,
      connectionCount,
    );
  }
  async releaseDatasetStoreConnectionsInternal(
    tenantId: string,
    connectionCount: number,
  ): Promise<number> {
    let clueSettings: ClueSettings = await this.clueSettingsModel
      .findOne()
      .exec();
    if (clueSettings.installationType !== 'Multi-tenant') {
      await this.tenantModel
        .findOneAndUpdate(
          { id: tenantId },
          { $inc: { dataConnectionCount: -connectionCount } },
        )
        .exec();
    }
    return connectionCount;
  }
}
