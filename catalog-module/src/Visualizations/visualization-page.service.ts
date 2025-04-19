import { Injectable, Inject } from "@nestjs/common";
import { Model } from 'mongoose';
import { VisualizationPage } from '../../../database-module/src/database.schemas';
import uuidv4 = require('uuid/v4');
import { VisualizationPageObject } from "../../../object-schema/src/schemas/catalog.visualization-page";


@Injectable()
export class VisualizationPageService {

    constructor(
        @Inject('visualizationPageProvider') private readonly vizPageProvider: Model<VisualizationPage>
    ) { }

    async createVisualizationPage(VisualizationPage: VisualizationPageObject, userId: string, tenantId: string): Promise<any> {
        const newVisualizationPage = new this.vizPageProvider(VisualizationPage);
        newVisualizationPage.id = uuidv4();
        newVisualizationPage.userId = userId;
        newVisualizationPage.tenantId = tenantId;
        newVisualizationPage.lastUpdate = new Date().getTime();
        return newVisualizationPage.save();
    }

    async findVisualizationPageById(theId: any): Promise<any> {
        return this.vizPageProvider.findOne({ id: theId }).exec().then((result) => {
            return [result];
        });
    }

    async findVisualizationPageByUserId(id: any): Promise<any> {
        return this.vizPageProvider.find({ userId: id }).exec();
    }
    async findVisualizationPageByTenantId(id: any): Promise<any> {
        return this.vizPageProvider.find({ tenantId: id }).exec();
    }
    async updateVisualizationPage(theId: string, body: any, userId: string, tenantId: string): Promise<any> {
        body.lastUpdate = new Date().getTime();
        return this.vizPageProvider.findOneAndUpdate({ id: theId }, body, { new: true }).exec().then((result) => {
            if (!result) {
                const newVisualizationPage = new this.vizPageProvider(body);
                newVisualizationPage.id = theId;
                newVisualizationPage.userId = userId;
                newVisualizationPage.tenantId = tenantId;
                newVisualizationPage.lastUpdate = new Date().getTime();
                return newVisualizationPage.save();
            } else return result;
        });
    }

    async getRecentVisualizationPageByTenantId(count: number, theTenantId: string): Promise<any> {
        return this.vizPageProvider.find({ tenantId: theTenantId }).sort({
            lastUpdate: -1,
        }).limit(count).exec();
    }

    async getRecentVisualizationPageByUserId(count: number, theUserId: string): Promise<any> {
        return this.vizPageProvider.find({ userId: theUserId }).sort({
            lastUpdate: -1,
        }).limit(count).exec();
    }

    async deleteVisualizationPage(vizPageId: string): Promise<any> {
        return this.vizPageProvider.deleteOne({ id: vizPageId }).exec();
    }
}