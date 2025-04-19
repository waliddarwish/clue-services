import { Injectable, Inject } from "@nestjs/common";
import { Model } from 'mongoose';
import { VisualizationBook, VisualizationPage } from '../../../database-module/src/database.schemas';
import uuidv4 = require('uuid/v4');
import { VisualizationBookObject } from "../../../object-schema/src/schemas/catalog.visualization-book";


@Injectable()
export class VisualizationBookService {
   
    constructor(
        @Inject('visualizationBookProvider') private readonly vizBookProvider: Model<VisualizationBook>,
        @Inject('visualizationPageProvider') private readonly vizPageProvider: Model<VisualizationPage>
    ) { }

    async createVisualizationBook(VisualizationBook: VisualizationBookObject, userId: string, tenantId: string): Promise<any> {
        const newVisualizationBook = new this.vizBookProvider(VisualizationBook);
        newVisualizationBook.id = uuidv4();
        newVisualizationBook.userId = userId;
        newVisualizationBook.tenantId = tenantId;
        newVisualizationBook.lastUpdate = new Date().getTime();
        newVisualizationBook.creationDate = new Date().getTime();
        return newVisualizationBook.save();
    }

    async findVisualizationBookById(theId: any): Promise<any> {
        return this.vizBookProvider.findOne({ id: theId }).exec().then((result) => {
            return [result];
        });
    }

    async findVisPagesByVizBookId(theId: any): Promise<any> {
        return this.vizPageProvider.find({ visualizationBookId: theId }).exec();
    }

    async findVisPageByVizBookId(bookId, pageId): Promise<any> {
        return this.vizPageProvider.findOne({ visualizationBookId: bookId, id: pageId }).exec();
    }

    async findVisualizationBookByUserId(id: any): Promise<any> {
        return this.vizBookProvider.find({ userId: id }).exec();
    }
    async findVisualizationBookByTenantId(id: any): Promise<any> {
        return this.vizBookProvider.find({ tenantId: id }).exec();
    }
    async updateVisualizationBook(theId: string, body: any): Promise<any> {
        body.lastUpdate = new Date().getTime();
        return this.vizBookProvider.findOneAndUpdate({ id: theId }, body, { new: true }).exec();
    }

    async getRecentVisualizationBookByTenantId(count: number, theTenantId: string): Promise<any> {
        return this.vizBookProvider.find({ tenantId: theTenantId }).sort({
            lastUpdate: -1,
        }).limit(count).exec();
    }

    async getRecentVisualizationBookByUserId(count: number, theUserId: string): Promise<any> {
        return this.vizBookProvider.find({ userId: theUserId }).sort({
            lastUpdate: -1,
        }).limit(count).exec();
    }

    async deleteVisualizationBook(vizBookId: string): Promise<any> {
        return this.vizPageProvider.deleteMany({ visualizationBookId: vizBookId }).exec().then((result) => {
            return this.vizBookProvider.deleteOne({ id: vizBookId }).exec();
        });
    }

    async getRecentVizByTenantId(count: number, tenantId: any): Promise<any> {
        return this.vizBookProvider.find({ tenantId }).sort({
            lastUpdate: -1,
        }).limit(count).exec();
    }

}