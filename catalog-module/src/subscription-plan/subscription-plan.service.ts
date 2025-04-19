import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionPlan } from '../../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import uuidv4 = require('uuid/v4');
import { SubscriptionPlanObject } from '../../../object-schema/src/schemas/catelog.subscription-plan';

@Injectable()
export class SubscriptionPlanService {
  

  constructor(
    @Inject('subscriptionPlanProvider')
    private readonly subscriptionPlanProvider: Model<SubscriptionPlan>,
  ) { }


  async add(body: any): Promise<any> {
    body.lastUpdate = new Date().getTime();
    const createdPlan = new this.subscriptionPlanProvider(body);
    createdPlan.id = uuidv4();
    return createdPlan.save();
  }
  async update(planId: any, body: SubscriptionPlanObject): Promise<any>  {
    body.lastUpdate = new Date().getTime();
    return this.subscriptionPlanProvider.updateOne({id: planId} , body).exec();
  }
  async delete(planId: any): Promise<any>  {
    return this.subscriptionPlanProvider.deleteOne({id: planId}).exec();
  }
  async getAll(): Promise<SubscriptionPlanObject[]> {
    return this.subscriptionPlanProvider.find().exec();
  }
  async getAllActive(): Promise<SubscriptionPlanObject[]> {
    return this.subscriptionPlanProvider.find({status: 'Active'}).exec();
  }
  async get(planId: any): Promise<any>  {
    return this.subscriptionPlanProvider.findOne({id: planId}).exec();
  }
  async validateExistingStripeCodePlan(plan: SubscriptionPlanObject): Promise<any> {
      return this.subscriptionPlanProvider.findOne({planStripeCode: plan.planStripeCode}).exec();
  }
  async validateEditedStripeCodePlan(plan: SubscriptionPlanObject, planId:string): Promise<any> {
      return this.subscriptionPlanProvider.findOne({planStripeCode: plan.planStripeCode, id: {$ne : planId}}).exec();
  }
}
