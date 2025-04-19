import { ClueModelService } from "./model.service";

describe('Test ClueModelService ', () => {
let modelProvider;
let modelObjectProvider;
let newModel = {};
let newModelObj = {
    modelObjectItems: []
};
let clueModelService;

    beforeEach(async () => {
        jest.clearAllMocks();
        modelProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return newModel }),
                save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
            }});

        modelProvider.findOneAndUpdate = jest.fn().mockReturnValue(modelProvider);
        modelProvider.find = jest.fn().mockReturnValue(modelProvider);
        modelProvider.deleteOne = jest.fn().mockReturnValue(modelProvider);
        modelProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'modelProviderExec' })),
        modelProvider.sort = jest.fn().mockReturnValue(modelProvider);
        modelProvider.limit = jest.fn().mockReturnValue(modelProvider);

        modelObjectProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return newModelObj }),
                save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
                modelObjectItems: []
            }
        });
        modelObjectProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'modelObjProviderExec' })),
        modelObjectProvider.deleteMany = jest.fn().mockReturnValue(modelObjectProvider);
        modelObjectProvider.deleteOne = jest.fn().mockReturnValue(modelObjectProvider);
        modelObjectProvider.findOne = jest.fn().mockReturnValue(modelObjectProvider);
        modelObjectProvider.find = jest.fn().mockReturnValue(modelObjectProvider);
        modelObjectProvider.findOneAndUpdate = jest.fn().mockReturnValue(modelObjectProvider);


        clueModelService = new ClueModelService(modelProvider, modelObjectProvider);
    });

    it('test createClueModel', async() => {
        let result = await clueModelService.createClueModel({}, 'userId', 'tenantId');
        expect(result).toEqual({ name: 'saved' });
    });

    it('test findClueModelById', async() => {
        let result = await clueModelService.findClueModelById('theId');
        expect(result).toEqual([{ name: 'modelProviderExec' }]);
        expect(modelProvider.findOneAndUpdate).toBeCalledWith({ id: 'theId' }, { lastAccess: expect.anything() });
    });

    it('test findClueModelByUserId', async() => {
        let result = await clueModelService.findClueModelByUserId('theId');
        expect(result).toEqual({ name: 'modelProviderExec' });
        expect(modelProvider.find).toBeCalledWith({ userId: 'theId' });
    });

    it('test findClueModelByTenantId', async() => {
        let result = await clueModelService.findClueModelByTenantId('theId');
        expect(result).toEqual({ name: 'modelProviderExec' });
        expect(modelProvider.find).toBeCalledWith({ tenantId: 'theId' });
    });

    it('test updateClueModel', async() => {
        let result = await clueModelService.updateClueModel('theId', {});
        expect(result).toEqual({ name: 'modelProviderExec' });
        expect(modelProvider.findOneAndUpdate).toBeCalledWith({ id: 'theId' }, expect.anything(), { new: true });
    });

    it('test getRecentModelByUserId', async() => {
        let result = await clueModelService.getRecentModelByUserId(10, 'theId');
        expect(result).toEqual({ name: 'modelProviderExec' });
        expect(modelProvider.find).toBeCalledWith({ userId: 'theId'});
        expect(modelProvider.sort).toBeCalledWith({lastAccess: -1,});
        expect(modelProvider.limit).toBeCalledWith(10);
    });

    it('test deleteModel', async() => {
        let theModelId = 'theId';
        let result = await clueModelService.deleteModel(theModelId);
        expect(result).toEqual({ name: 'modelProviderExec' });
        expect(modelProvider.deleteOne).toBeCalledWith({ id: theModelId });
        expect(modelObjectProvider.deleteMany).toBeCalledWith({ clueModelId: theModelId })
    });


    it('test createClueModelObject', async() => {
        let result = await clueModelService.createClueModelObject({modelObjectItems: []}, 'userId', 'tenantId');
        expect(result).toEqual({ name: 'saved' });
    });

    it('test findClueModelObjectById', async() => {
        let theId = 'theId';
        let result = await clueModelService.findClueModelObjectById(theId);
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.findOne).toBeCalledWith({ id: theId });
    });

    it('test findClueModelObjectByUserId', async() => {
        let theId = 'theId';
        let result = await clueModelService.findClueModelObjectByUserId(theId);
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.find).toBeCalledWith({ userId: theId });
    });

    it('test findClueModelObjectByTenantId', async() => {
        let theId = 'theId';
        let result = await clueModelService.findClueModelObjectByTenantId(theId);
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.find).toBeCalledWith({ tenantId: theId });
    });

    it('test findClueModelObjectByConnectionId', async() => {
        let theId = 'theId';
        let result = await clueModelService.findClueModelObjectByConnectionId(theId);
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.find).toBeCalledWith({ dataSourceConnectionId: theId });
    });

    it('test findClueModelObjectByModelId', async() => {
        let theId = 'theId';
        let result = await clueModelService.findClueModelObjectByModelId(theId);
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.find).toBeCalledWith({ clueModelId: theId });
    });

    it('test updateClueModelObject', async() => {
        let theId = 'theId';
        let result = await clueModelService.updateClueModelObject(theId, {});
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.findOneAndUpdate).toBeCalledWith({ id: theId }, {}, { new: true });
    });

    it('test deleteModelObject', async() => {
        let theId = 'theId';
        let result = await clueModelService.deleteModelObject(theId);
        expect(result).toEqual({ name: 'modelObjProviderExec' });
        expect(modelObjectProvider.deleteOne).toBeCalledWith({ id: theId });
    });

});