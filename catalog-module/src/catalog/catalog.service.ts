import { Inject, Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserObject } from '../../../object-schema/src/schemas/catalog.user';
import { TenantObject } from '../../../object-schema/src/schemas/catalog.tenant';
// tslint:disable-next-line: max-line-length
import { Tenant, User, Node, DataSourceConnection, Invitation, TaskEntry, MetadataImportTaskTracker, ClueModel, ClueModelObject, Dataset, VisualizationPage, VisualizationBook } from '../../../database-module/src/database.schemas';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { AppMailService } from '../../../mail-module/src/mail.service';
import uuidv4 = require('uuid/v4');
import passwordGenerator = require('generate-password');
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
@Injectable()
export class CatalogService {
  private logger = new Logger('CatalogService');
  constructor(
    @Inject('tenantProvider') private readonly tenantModel: Model<Tenant>,
    @Inject('userProvider') private readonly userModel: Model<User>,
    @Inject('invitationProvider') private readonly invitationModel: Model<Invitation>,
    @Inject('taskProvider') private readonly taskModel: Model<TaskEntry>,
    @Inject('metadataTrackerProvider') private readonly metadataTrackerProvider: Model<MetadataImportTaskTracker>,
    private readonly authService: AuthenticationService,
    private readonly mailService: AppMailService,
    @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
    @Inject('modelProvider') private readonly clueModel: Model<ClueModel>,
    @Inject('modelObjectProvider') private readonly clueModelObject: Model<ClueModelObject>,
    @Inject('datasetProvider') private readonly datasetProvider: Model<Dataset>,
    @Inject('visualizationBookProvider') private readonly vizBookProvider: Model<VisualizationBook>,
    @Inject('visualizationPageProvider') private readonly vizPageProvider: Model<VisualizationPage>,
    @InjectStripe() private readonly stripeClient: Stripe | any) { }

  async deleteTenant(theTenantId: any): Promise<any> {
    return this.tenantModel.deleteOne({ id: theTenantId }).exec().then((result) => {
      this.userModel.deleteMany({ tenantId: theTenantId }).exec();
      this.invitationModel.deleteMany({ tenantId: theTenantId }).exec();
      this.taskModel.deleteMany({ tenantId: theTenantId }).exec();
      this.dsConnectionModel.deleteMany({ tenantId: theTenantId }).exec();
      this.metadataTrackerProvider.deleteMany({ tenantId: theTenantId }).exec();
      this.clueModelObject.deleteMany({ tenantId: theTenantId }).exec();
      this.clueModel.deleteMany({ tenantId: theTenantId }).exec();
      this.datasetProvider.deleteMany({ tenantId: theTenantId }).exec();
      this.vizBookProvider.deleteMany({ tenantId: theTenantId }).exec();
      this.vizPageProvider.deleteMany({ tenantId: theTenantId }).exec();
      return result;
    });
  }

  async createTenantSubscription(tenantObject: TenantObject, userObject: UserObject): Promise<any> {
    if (tenantObject.paymentDetails.subscribeTenant) {
      return this.stripeClient.customers.create({
        payment_method: tenantObject.paymentDetails.paymentMethod.id,
        name: tenantObject.paymentDetails.paymentMethod.name,
        email: userObject.username,
        invoice_settings: {
          default_payment_method: tenantObject.paymentDetails.paymentMethod.id,
        },
      }).then((customer) => {
        tenantObject.paymentDetails.stripeCustomerDetails = customer;
        return this.stripeClient.subscriptions.create({
          customer: customer.id,
          items: [{ plan: tenantObject.subscriptionPlan, quantity: 1 }],
        }).then((subscription) => {
          tenantObject.paymentDetails.stripeSubscription = subscription;
          return tenantObject;
        });
      });
    } else {
      return tenantObject;
    }
  }


  async getSubscriptionPlan(): Promise<any> {
    return this.stripeClient.plans.list().catch((error) => {
      this.logger.error(error);
    });
  }

  async createTenant(tenantObject: TenantObject, userObject: UserObject): Promise<any> {
    
    return this.tenantModel.db.startSession().then((session) => {
      session.startTransaction();
      return this.createTenantSubscription(tenantObject, userObject).then((subscribedTenant) => {
        subscribedTenant.dataConnectionCount = 0;
        const createdTenant = new this.tenantModel(subscribedTenant);
        createdTenant.id = uuidv4();
        return createdTenant.save({ session }).then((tenant: TenantObject) => {
          return this.createTenantAdmin(userObject, createdTenant, session, tenant);
        });
      }).catch((error) => {
        session.abortTransaction().then(() => {
          session.endSession();
        });
        throw error;
      });
    });
  }

  public createTenantAdmin(userObject: UserObject, createdTenant: any, session: any, tenant: TenantObject): Promise<any> {
    userObject.id = uuidv4();
    userObject.tenantId = createdTenant.id;
    userObject.role = 'TenantAdmin';
    return this.authService.hashEncryptedPassword(userObject.password, userObject.id).then((result) => {
      if (result.status === 0) {
        userObject.password = result.data;
        const createdUser = new this.userModel(userObject);
        return createdUser.save({ session }).then((user: UserObject) => {
          session.commitTransaction().then(() => {
            session.endSession();
          });
          this.mailService.sendMail('welcome', user.username, { name: user.name.firstName + ' ' + user.name.lastName }); // send mail async
          user.password = null;
          return { tenant, user };
        });
      } else {
        throw new Error('Unable to register tenant');
      }
    });
  }


  updateTenantSubQuantity(tenantId: string, quantity: number) {
  }

  async updateStripeSubQuantity(tenantId: string, quantity: number) {
    //retrieve the tenantPlanId first
    const tenant = await this.getTenantSubscriptionPlanId(tenantId).catch((error) => {
      throw error;
    });
    const planId = tenant.paymentDetails.stripeSubscription.id;
    //retrive the quantity first then update
    const subscription = await this.stripeClient.subscriptions.retrieve(planId);
    const updateQuantity = subscription.quantity + quantity;
    return this.stripeClient.subscriptions.update(
      planId,
      { items: [{ id: subscription.items.data[0].id, quantity: updateQuantity }] })
  }

  getTenantSubscriptionPlanId(tenandId: string): Promise<any> {
    return this.tenantModel.findOne({ id: tenandId }).exec().catch((error) => {
      throw error;
    });
  }
  async createUser(userObject: UserObject): Promise<User> {
    const createdUser = new this.userModel(userObject);
    return createdUser.save().then(() => {
      return this.updateStripeSubQuantity(userObject.tenantId, 1);
    }).catch((error) => {
      this.logger.error(error);
    });
  }

  async deleteTenantUser(userId): Promise<any> {
    const user = await this.userModel.findOne({ id: userId }).exec();
    return this.invitationModel.deleteMany({ email: user.username }).exec().then(() => {
      return this.userModel.deleteOne({ id: userId }).exec().then(
        (result) => {
          if (result === true) {
            return this.getUser(userId).then((user) => {
              if (user) {
                // update the quantity by -1 is successfully delete user
                return this.updateStripeSubQuantity(user.tenantId, -1);
              }
            }); 
          } else {
            return false;
          }
        });
    });
  }

  async createUserWithTempPassword(userObject: UserObject): Promise<any> {
    const theNewPassword = passwordGenerator.generate();
    const createdUser = new this.userModel(userObject);
    createdUser.id = uuidv4();
    return this.authService.hashPlainPassword(theNewPassword, createdUser.id).then((result) => {
      if (result.status === 0) {
        createdUser.password = result.data;
        createdUser.passwordStatus = 'Reset';
        return createdUser.save().then((user) => {
          this.mailService.sendMail('temp-password', user.username, {
            name: user.name.firstName + ' '
              + user.name.lastName, newPassword: theNewPassword,
          });
          return { status: 0, data: user };
        });
      } else {
        return { status: -1, data: result.data };
      }
    });
  }


  async findAllTenants(): Promise<any> {
    return this.tenantModel.find().exec();
  }
  async findUsersByTenant(theTenantId: any): Promise<any> {
    return this.userModel.find({ tenantId: theTenantId }).exec();
  }

  async isUserExists(theUsername: any): Promise<any> {
    return this.userModel.find({ username: theUsername }).exec().then((result) => {
      if (result.length === 1) {
        return true;
      } else {
        return false;
      }
    });
  }

  async updateUser(userId, userObject: UserObject): Promise<any> {
    return this.userModel.updateOne({ id: userId }, { ...userObject }).exec();
  }
  getUser(userId: string): Promise<UserObject> {
    return this.userModel.findOne({ id: userId }).exec();
  }
  async changeUserStatus(userId: any, status: any): Promise<any> {
    return this.userModel.updateOne({ id: userId }, { status }).exec().then((result) => {
      if (result.status === 0) {
        return this.getUser(userId).then((user) => {
          if (user) {
            if (status === 'Active')
              // add 1 sub
              return this.updateStripeSubQuantity(user.tenantId, 1);
            else
              //remove 1 sub
              return this.updateStripeSubQuantity(user.tenantId, -1);
          }
        });

      }
    });
  }

  async changeTenantStatus(tenantId: any, status: any): Promise<any> {
    return this.tenantModel.updateOne({ id: tenantId }, { status }).exec();
  }

  async updateTenant(tenantId: any, tenantObject: TenantObject): Promise<any> {
    return this.tenantModel.updateOne({ id: tenantId }, { ...tenantObject }).exec();
  }

  async updateTenantPlan(tenant: any, newPlanCode: string): Promise<any> {
    this.stripeClient.subscriptions.del(
      tenant.paymentDetails.stripeSubscription.id).catch((error) => {
        this.logger.error(error);
      });

    return this.stripeClient.subscriptions.create({
      customer: tenant.paymentDetails.stripeCustomerDetails.id,
      items: [{ plan: newPlanCode, quantity: 1 }],  // Qty should be the number of active users for this tenant
    }).then((subscription) => {
      tenant.paymentDetails.stripeSubscription = subscription;
      tenant.subscriptionPlan = newPlanCode;
      return this.tenantModel.updateOne({ id: tenant.id }, tenant).exec();
    });
  }

  async updateTenantPaymentMethod(tenant: any, newPaymentMethod: any): Promise<any> {
    this.stripeClient.paymentMethods.detach(tenant.paymentDetails.paymentMethod.id).catch(error => {
      // cant' delete old card, no problem, remove if manually from stripe dashboard
      this.logger.error(error);
    });

    return this.stripeClient.paymentMethods.attach(newPaymentMethod.id,
      { customer: tenant.paymentDetails.stripeCustomerDetails.id }).then(() => {
        return this.stripeClient.customers.update(tenant.paymentDetails.stripeCustomerDetails.id, {
          invoice_settings: {
            default_payment_method: newPaymentMethod.id,
          },
        }).then(() => {
          tenant.paymentDetails.paymentMethod = newPaymentMethod;
          return this.tenantModel.updateOne({ id: tenant.id }, tenant).exec();
        });
      });
  };

  async isPlanCurrenlyUsed(planName: any): Promise<any> {
    return this.tenantModel.find({ subscriptionPlan: planName }).exec().then((result) => {
      if (result.length >= 1) {
        return true;
      } else {
        return false;
      }
    });
  }
}
