import { VisualizationPageService } from "./visualization-page.service";



describe('', () => {

let vizPageProvider;
let newPage = {};
let visualizationPageService;

    beforeEach(async () => {
        jest.clearAllMocks();
        vizPageProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return newPage }),
                save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
            }});
        vizPageProvider.findOne = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.find = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.sort = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.limit = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.findOneAndUpdate = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.deleteOne = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'vizPageProviderExec' }));
        
        visualizationPageService = new VisualizationPageService(vizPageProvider);
    });

    it('test createVisualizationBook', async ()=> {
        let result = await visualizationPageService.createVisualizationPage({}, 'userId', 'tenantId');
        expect(result).toEqual({ name: 'saved' });
    });


    it('test findVisualizationPageById', async ()=> {
        let theId = 'theId';
        let result = await visualizationPageService.findVisualizationPageById(theId);
        expect(result).toEqual([{ name: 'vizPageProviderExec' }]);
        expect(vizPageProvider.findOne).toBeCalledWith({ id: theId });
    });

    it('test findVisualizationPageByUserId', async ()=> {
        let theId = 'theId';
        let result = await visualizationPageService.findVisualizationPageByUserId(theId);
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.find).toBeCalledWith({ userId: theId });
    });

    it('test findVisualizationPageByTenantId', async ()=> {
        let theId = 'theId';
        let result = await visualizationPageService.findVisualizationPageByTenantId(theId);
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.find).toBeCalledWith({ tenantId: theId });
    });

    it('test updateVisualizationPage', async ()=> {
        let theId = 'theId';
        let body = {lastUpdate: ''};
        let result = await visualizationPageService.updateVisualizationPage(theId, body, 'userId', 'tenantId');
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.findOneAndUpdate).toBeCalledWith({ id: theId }, body, { new: true });
    });

    it('test updateVisualizationPage scenario 2', async ()=> {
        let theId = 'theId';
        let body = {lastUpdate: ''};
        vizPageProvider.exec.mockReturnValue(Promise.resolve(null));
        let result = await visualizationPageService.updateVisualizationPage(theId, body, 'userId', 'tenantId');
        expect(result).toEqual({ name: 'saved' });
        expect(vizPageProvider.findOneAndUpdate).toBeCalledWith({ id: theId }, body, { new: true });
    });

    it('test getRecentVisualizationPageByTenantId', async ()=> {
        let theTenantId = 'theId';
        let count = 5;
        let result = await visualizationPageService.getRecentVisualizationPageByTenantId(count, theTenantId);
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.find).toBeCalledWith({ tenantId: theTenantId });
        expect(vizPageProvider.sort).toBeCalledWith({lastUpdate: -1,});
        expect(vizPageProvider.limit).toBeCalledWith(count);
    });

    it('test getRecentVisualizationPageByUserId', async ()=> {
        let theUserId = 'theId';
        let count = 5;
        let result = await visualizationPageService.getRecentVisualizationPageByUserId(count, theUserId);
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.find).toBeCalledWith({ userId: theUserId });
        expect(vizPageProvider.sort).toBeCalledWith({lastUpdate: -1,});
        expect(vizPageProvider.limit).toBeCalledWith(count);
    });

    it('test deleteVisualizationPage', async ()=> {
        let theId = 'theId';
        let result = await visualizationPageService.deleteVisualizationPage(theId);
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.deleteOne).toBeCalledWith({ id: theId });
    });
});