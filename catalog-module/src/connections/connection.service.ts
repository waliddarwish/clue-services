import { Inject, Injectable } from '@nestjs/common';
import { DataSourceConnection } from '../../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { DataSourceConnectionObject } from '../../../object-schema/src/schemas/catalog.connection';
import { ConnectionTestService } from '../../../connection-test-module/src/connection-test.service';
import uuidv4 = require('uuid/v4');

@Injectable()
export class DataSourceConnectionService {
    
    

    constructor(
        @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
        private readonly connectionTestService: ConnectionTestService) { }

    async createDataSourceConnection(dataSourceConnection: DataSourceConnectionObject , userId: string , tenantId: string): Promise<any> {
        const newConnection = new this.dsConnectionModel(dataSourceConnection);
        newConnection.id = uuidv4();
        newConnection.userId = userId;
        newConnection.tenantId = tenantId;
        newConnection.lastAccess = new Date().getTime();
        newConnection.creationDate = new Date().getTime();
        return newConnection.save();
    }

    async findDataSourceConnectionById(theId: any): Promise<any> {
        return this.dsConnectionModel.findOneAndUpdate({ id: theId} , { lastAccess : new Date().getTime() }).exec();
    }

    async deleteConnectionById(theId: any): Promise<any> {
        return this.dsConnectionModel.deleteOne({id: theId }).exec();
    }

    async updateConnection(theId: string, body: any): Promise<any> {
        body.lastAccess = new Date().getTime();
        return this.dsConnectionModel.findOneAndUpdate({ id: theId }, body, { new: true } ).exec();
    }

    async findDataSourceConnectionByUserId(id: any): Promise<any> {
        return this.dsConnectionModel.find({ userId : id }).exec();
    }

    async findDataSourceConnectionByTenantId(id: any): Promise<any> {
        return this.dsConnectionModel.find({ tenantId: id }).exec();
    }

    async searchDataSourceConnection(searchText: string, theTenantId: string): Promise<any> {
        return this.dsConnectionModel.find({ $text: { $search: searchText } , tenantId: theTenantId }).exec();

    }

    async testDataSourceConnection(body: any): Promise<any> {
        if (!body.connectionInfo.connectionTimeout) {
            body.connectionInfo.connectionTimeout = 60000;
        }
        return this.connectionTestService.testConnection(body);
    }

    async testDataSourceConnectionById(theId: any): Promise<any> {
    return this.dsConnectionModel.findOne({id: theId}).exec().then((result) => {
        if (result) {
            if (!result.connectionInfo.connectionTimeout) {
                result.connectionInfo.connectionTimeout = 60000;
            }
            return this.connectionTestService.testConnection(result);
        } else {
            return { result: 'Database connection not found'};
        }
        });
    }

    async getRecentConnections(count: number , theTenantId: string): Promise<any> {
        return this.dsConnectionModel.find({ tenantId: theTenantId }).sort({
            lastAccess: -1,
        }).limit(count).exec();
    }

    async deleteConnections(theUserId: any): Promise<any> {
        return this.dsConnectionModel.deleteMany({ userId: theUserId }).exec();
    }

}
