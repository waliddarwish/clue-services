import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Invitation, Tenant, DataSourceConnection, VisualizationBook, VisualizationPage } from '../../../database-module/src/database.schemas';
import { User, Node, TaskEntry, ClueModel, ClueModelObject, MetadataImportTaskTracker, SubscriptionPlan, Dataset } from '../../../database-module/src/database.schemas';

@Injectable()
export class SearchService {
  
  private connections: any = {
  };

  constructor(
    @Inject('invitationProvider') private readonly inviteModel: Model<Invitation>,
    @Inject('tenantProvider') private readonly tenantModel: Model<Tenant>,
    @Inject('userProvider') private readonly userModel: Model<User>,
    @Inject('nodeProvider') private readonly nodeModel: Model<Node>,
    @Inject('invitationProvider') private readonly invitationModel: Model<Invitation>,
    @Inject('taskProvider') private readonly taskModel: Model<TaskEntry>,
    @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
    @Inject('modelProvider') private readonly clueModelModel: Model<ClueModel>,
    @Inject('modelObjectProvider') private readonly clueModelObjectModel: Model<ClueModelObject>,
    @Inject('metadataTrackerProvider') private readonly metadataTrackerProvider: Model<MetadataImportTaskTracker>,
    @Inject('subscriptionPlanProvider') private readonly subscriptionPlanProvider: Model<SubscriptionPlan>,
    @Inject('datasetProvider') private readonly datasetProvider: Model<Dataset>,
    @Inject('visualizationBookProvider') private readonly vizBookProvider: Model<VisualizationBook>,
    @Inject('visualizationPageProvider') private readonly vizPageProvider: Model<VisualizationPage>

  ) {
    this.connections = {
      // tslint:disable-next-line: no-string-literal
      tenants: tenantModel,
      // tslint:disable-next-line: no-string-literal
      users: userModel,
      // tslint:disable-next-line: no-string-literal
      invitations: invitationModel,
      // tslint:disable-next-line: no-string-literal
      connections: dsConnectionModel,
      // tslint:disable-next-line: no-string-literal
      tasks: taskModel,
      // tslint:disable-next-line: no-string-literal
      models: clueModelModel,
      // tslint:disable-next-line: no-string-literal
      modelObjects: clueModelObjectModel,
      // tslint:disable-next-line: no-string-literal
      metadataTrackers: metadataTrackerProvider,
      // tslint:disable-next-line: no-string-literal
      subscriptions: subscriptionPlanProvider,
      // tslint:disable-next-line: no-string-literal
      datasets: datasetProvider,
      // tslint:disable-next-line: no-string-literal
      visualizations: vizBookProvider,
      // tslint:disable-next-line: no-string-literal
      visualizationPages: vizPageProvider,
    };
  }
  
  async getCount(scope , days, criteria, tenantId: any) : Promise<any> {
    if (tenantId) { criteria.tenantId = tenantId; }
    let numberOfDays = parseInt(days);
    if (numberOfDays === 0) {
      return this.connections[scope].countDocuments(criteria).exec();
    } else {
      let current = new Date().getTime();
      let since = numberOfDays * 24 * 60 * 60 * 1000;
      return this.connections[scope].countDocuments({...criteria , creationDate : { $gt: current - since }}).exec();
    }

  }


  async find(
          scope: string,
          criteria: any,
          projections: any,
          options: any,
          theTenantId: string,
          page: number,
          pageSize: number): Promise<any> {
    if (theTenantId) { criteria.tenantId = theTenantId; }
    let query = this.connections[scope].find(criteria, projections, options);
    query = query.skip((page - 1) * pageSize).limit(pageSize);
    return query.exec();
  }
}
