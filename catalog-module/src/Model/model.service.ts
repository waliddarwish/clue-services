import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  ClueModel,
  ClueModelObject,
} from '../../../database-module/src/database.schemas';
import uuidv4 = require('uuid/v4');
import { ClueModelObjectEntry } from '../../../object-schema/src/schemas/catalog.model-object';
import { ClueModelEntryDTO } from '../../../object-schema/src/schemas/catalog.model';

@Injectable()
export class ClueModelService {
  constructor(
    @Inject('modelProvider') private readonly modelProvider: Model<ClueModel>,
    @Inject('modelObjectProvider')
    private readonly modelObjectProvider: Model<ClueModelObject>,
  ) {}

  async createClueModel(
    clueModel: ClueModelEntryDTO,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const newClueModel = new this.modelProvider(clueModel);
    newClueModel.id = uuidv4();
    newClueModel.userId = userId;
    newClueModel.tenantId = tenantId;
    newClueModel.lastAccess = new Date().getTime();
    newClueModel.creationDate = new Date().getTime();

    return newClueModel.save();
  }

  async findClueModelById(theId: any): Promise<any> {
    return this.modelProvider
      .findOneAndUpdate({ id: theId }, { lastAccess: new Date().getTime() })
      .exec()
      .then(result => {
        if (result) return [result];
        return [];
      });
  }

  async findClueModelByUserId(id: any): Promise<any> {
    return this.modelProvider.find({ userId: id }).exec();
  }
  async findClueModelByTenantId(id: any): Promise<any> {
    return this.modelProvider.find({ tenantId: id }).exec();
  }
  async updateClueModel(theId: string, body: any): Promise<any> {
    body.lastAccess = new Date().getTime();
    return this.modelProvider
      .findOneAndUpdate({ id: theId }, body, { new: true })
      .exec();
  }

  async getRecentModelByTenantId(
    count: number,
    theTenantId: string,
  ): Promise<any> {
    return this.modelProvider
      .find({ tenantId: theTenantId })
      .sort({
        lastAccess: -1,
      })
      .limit(count)
      .exec();
  }

  async getRecentModelByUserId(count: number, theUserId: string): Promise<any> {
    return this.modelProvider
      .find({ userId: theUserId })
      .sort({
        lastAccess: -1,
      })
      .limit(count)
      .exec();
  }

  async deleteModel(theModelId: string): Promise<any> {
    return this.modelProvider
      .deleteOne({ id: theModelId })
      .exec()
      .then(result => {
        this.modelObjectProvider.deleteMany({ clueModelId: theModelId }).exec();
        return result;
      });
  }

  async createClueModelObject(
    clueModelObj: ClueModelObjectEntry,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const newClueModelObj = new this.modelObjectProvider(clueModelObj);
    newClueModelObj.id = uuidv4();
    newClueModelObj.userId = userId;
    newClueModelObj.tenantId = tenantId;
    newClueModelObj.modelObjectItems.forEach(item => {
      item.modelObjectItemId = uuidv4();
    });
    return newClueModelObj.save();
  }
  async findClueModelObjectById(theId: any): Promise<any> {
    return this.modelObjectProvider.findOne({ id: theId }).exec();
  }
  async findClueModelObjectByUserId(id: any): Promise<any> {
    return this.modelObjectProvider.find({ userId: id }).exec();
  }
  async findClueModelObjectByTenantId(id: any): Promise<any> {
    return this.modelObjectProvider.find({ tenantId: id }).exec();
  }
  async findClueModelObjectByConnectionId(id: any): Promise<any> {
    return this.modelObjectProvider.find({ dataSourceConnectionId: id }).exec();
  }
  async findClueModelObjectByModelId(id: any): Promise<any> {
    return this.modelObjectProvider.find({ clueModelId: id }).exec();
  }
  async updateClueModelObject(theId: string, body: any): Promise<any> {
    return this.modelObjectProvider
      .findOneAndUpdate({ id: theId }, body, { new: true })
      .exec();
  }
  async deleteModelObject(theId: string): Promise<any> {
    return this.modelObjectProvider.deleteOne({ id: theId }).exec();
  }
}
