import { VisualizationBookService } from "./visualization-book.service";



describe('Test VisualizationBookService', () => {

    let vizBookProvider;
    let vizPageProvider;
    let visualizationBookService;
    let newBook = {};

    beforeEach(async () => {
        jest.clearAllMocks();
        vizBookProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return newBook }),
                save: jest.fn().mockReturnValue(Promise.resolve({ name: 'saved' })),
            }});
        vizBookProvider.findOne = jest.fn().mockReturnValue(vizBookProvider);
        vizBookProvider.find = jest.fn().mockReturnValue(vizBookProvider);
        vizBookProvider.sort = jest.fn().mockReturnValue(vizBookProvider);
        vizBookProvider.limit = jest.fn().mockReturnValue(vizBookProvider);
        vizBookProvider.findOneAndUpdate = jest.fn().mockReturnValue(vizBookProvider);
        vizBookProvider.deleteOne = jest.fn().mockReturnValue(vizBookProvider);
        vizBookProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'vizBookProviderExec' }));

        vizPageProvider = {};
        vizPageProvider.findOne = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.find = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.findOneAndUpdate = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.deleteMany = jest.fn().mockReturnValue(vizPageProvider);
        vizPageProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'vizPageProviderExec' }));

        
        visualizationBookService = new VisualizationBookService(vizBookProvider, vizPageProvider);
    });

    it('test createVisualizationBook', async ()=> {
        let result = await visualizationBookService.createVisualizationBook({}, 'userId', 'tenantId');
        expect(result).toEqual({ name: 'saved' });
    });

    it('test findVisualizationBookById', async ()=> {
        let theId = 'theId';
        let result = await visualizationBookService.findVisualizationBookById(theId);
        expect(result).toEqual([{ name: 'vizBookProviderExec' }]);
        expect(vizBookProvider.findOne).toBeCalledWith({ id: theId });
    });


    it('test findVisPageByVizBookId', async ()=> {
        let result = await visualizationBookService.findVisPageByVizBookId('bookId', 'pageId');
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.findOne).toBeCalledWith({ visualizationBookId: 'bookId', id: 'pageId' });
    });


    it('test findVisPagesByVizBookId', async ()=> {
        let result = await visualizationBookService.findVisPagesByVizBookId('bookId');
        expect(result).toEqual({ name: 'vizPageProviderExec' });
        expect(vizPageProvider.find).toBeCalledWith({ visualizationBookId: 'bookId'});
    });

    it('test findVisualizationBookByUserId', async ()=> {
        let theId = 'theId';
        let result = await visualizationBookService.findVisualizationBookByUserId(theId);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizBookProvider.find).toBeCalledWith({ userId: theId });
    });

    it('test findVisualizationBookByTenantId', async ()=> {
        let theId = 'theId';
        let result = await visualizationBookService.findVisualizationBookByTenantId(theId);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizBookProvider.find).toBeCalledWith({ tenantId: theId });
    });

    it('test updateVisualizationBook', async ()=> {
        let theId = 'theId';
        let body = {};
        let result = await visualizationBookService.updateVisualizationBook(theId, body);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizBookProvider.findOneAndUpdate).toBeCalledWith({ id: theId }, body, { new: true });
    });

    it('test getRecentVisualizationBookByTenantId', async ()=> {
        let theTenantId = 'theId';
        let count = 5;
        let result = await visualizationBookService.getRecentVisualizationBookByTenantId(count, theTenantId);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizBookProvider.find).toBeCalledWith({ tenantId: theTenantId });
        expect(vizBookProvider.sort).toBeCalledWith({lastUpdate: -1,});
        expect(vizBookProvider.limit).toBeCalledWith(count);
    });

    it('test getRecentVisualizationBookByUserId', async ()=> {
        let theUserId = 'theId';
        let count = 5;
        let result = await visualizationBookService.getRecentVisualizationBookByUserId(count, theUserId);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizBookProvider.find).toBeCalledWith({ userId: theUserId });
        expect(vizBookProvider.sort).toBeCalledWith({lastUpdate: -1,});
        expect(vizBookProvider.limit).toBeCalledWith(count);
    });

    it('test deleteVisualizationBook', async ()=> {
        let theId = 'theId';
        let result = await visualizationBookService.deleteVisualizationBook(theId);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizPageProvider.deleteMany).toBeCalledWith({ visualizationBookId: theId });
        expect(vizBookProvider.deleteOne).toBeCalledWith({ id: theId });
    });

    it('test getRecentVizByTenantId', async ()=> {
        let tenantId = 'theId';
        let count = 5;
        let result = await visualizationBookService.getRecentVizByTenantId(count, tenantId);
        expect(result).toEqual({ name: 'vizBookProviderExec' });
        expect(vizBookProvider.find).toBeCalledWith({ tenantId});
        expect(vizBookProvider.sort).toBeCalledWith({lastUpdate: -1,});
        expect(vizBookProvider.limit).toBeCalledWith(count);
    });

});