import { DatasourceService } from "./datasource.service";


describe("Test DatasourceService ", () => {
    let datasetProvider;
    let dsConnectionModel;
    let modelProvider;
    let datasourceService;
    

    beforeEach(async() => {

        datasetProvider = {
            aggregate: jest.fn().mockImplementation(() => (datasetProvider)),
            exec: jest.fn()
        };
    
        modelProvider = {
            aggregate: jest.fn().mockImplementation(() => (modelProvider)),
            exec: jest.fn()
        };
    
        dsConnectionModel = {
            aggregate: jest.fn().mockImplementation(() => (dsConnectionModel)),
            exec: jest.fn()
        };

        datasourceService = new DatasourceService(datasetProvider, dsConnectionModel, modelProvider);
    });

    it('test getDatasources scenario 1', async () => {
        dsConnectionModel.exec.mockReturnValue(Promise.resolve(['result1']));
        datasetProvider.exec.mockReturnValue(Promise.resolve(['result2']));
        let result = await datasourceService.getDatasources('seartText', {tenantId: '1'}, 100, 100);
        expect(result).toEqual(['result1', 'result2']);
        expect(dsConnectionModel.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$name", "regex": /seartText/gi}}, "tenantId": '1'}}, {"$limit": 100}, {"$project": {"connectionType": 1, "datasourceType": "DatabaseConnection", "id": 1, "name": "$name", "serverName": "$connectionInfo.serverName", "serviceName": "$connectionInfo.serviceName", "userName": "$connectionInfo.username"}}]);
        expect(datasetProvider.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$datasetName", "regex": /seartText/gi}}, "tenantId": '1'}}, {"$limit": 100}, {"$project": {"connectionType": "Dataset", "datasourceType": "Dataset", "id": 1, "name": "$datasetName", "serverName": "N/A", "serviceName": "N/A", "userName": "N/A"}}]);
    });

    it('test getDatasources scenario 2', async () => {
        dsConnectionModel.exec.mockReturnValue(Promise.resolve(['result1']));
        datasetProvider.exec.mockReturnValue(Promise.resolve([]));
        let result = await datasourceService.getDatasources('seartText', {tenantId: '1'}, 100, 100);
        expect(result).toEqual(['result1']);
        expect(dsConnectionModel.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$name", "regex": /seartText/gi}}, "tenantId": '1'}}, {"$limit": 100}, {"$project": {"connectionType": 1, "datasourceType": "DatabaseConnection", "id": 1, "name": "$name", "serverName": "$connectionInfo.serverName", "serviceName": "$connectionInfo.serviceName", "userName": "$connectionInfo.username"}}]);
        expect(datasetProvider.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$datasetName", "regex": /seartText/gi}}, "tenantId": '1'}}, {"$limit": 100}, {"$project": {"connectionType": "Dataset", "datasourceType": "Dataset", "id": 1, "name": "$datasetName", "serverName": "N/A", "serviceName": "N/A", "userName": "N/A"}}]);
    });

    it('test getDatasources scenario 3', async () => {
        dsConnectionModel.exec.mockReturnValue(Promise.resolve([]));
        datasetProvider.exec.mockReturnValue(Promise.resolve([]));
        let result = await datasourceService.getDatasources('seartText', {tenantId: '1'}, 100, 100);
        expect(result).toEqual([]);
        expect(dsConnectionModel.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$name", "regex": /seartText/gi}}, "tenantId": '1'}}, {"$limit": 100}, {"$project": {"connectionType": 1, "datasourceType": "DatabaseConnection", "id": 1, "name": "$name", "serverName": "$connectionInfo.serverName", "serviceName": "$connectionInfo.serviceName", "userName": "$connectionInfo.username"}}]);
        expect(datasetProvider.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$datasetName", "regex": /seartText/gi}}, "tenantId": '1'}}, {"$limit": 100}, {"$project": {"connectionType": "Dataset", "datasourceType": "Dataset", "id": 1, "name": "$datasetName", "serverName": "N/A", "serviceName": "N/A", "userName": "N/A"}}]);
    });

    it('test getModelSources scenario 1', async () => {
        modelProvider.exec.mockReturnValue(Promise.resolve(['result1']));
        datasetProvider.exec.mockReturnValue(Promise.resolve(['result2']));
        let result = await datasourceService.getModelSources('seartText', {tenantId: '1'}, 100, 100);
        expect(result).toEqual(['result1', 'result2']);
        expect(modelProvider.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$name", "regex": /seartText/gi}}, "modelType": "public", "tenantId": "1"}}, {"$limit": 100}, {"$project": {"id": 1, "modelType": "$modelType", "modelsourceType": "Model", "name": "$name", "tenantId": "$tenantId", "userId": "$userId"}}]);
        expect(datasetProvider.aggregate).toBeCalledWith([{"$match": {"$expr": {"$regexMatch": {"input": "$datasetName", "regex": /seartText/gi}}, "tenantId": "1"}}, {"$limit": 100}, {"$project": {"id": "$skeletonModelId", "modelsourceType": "Dataset", "name": "$datasetName", "tenantId": "$tenantId", "userId": "$userId"}}]);

    });


});