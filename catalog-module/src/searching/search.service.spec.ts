import { SearchService } from './search.service';

let genericProvider = {
  find: jest.fn().mockImplementation(() => genericProvider),
  skip: jest.fn().mockImplementation(() => genericProvider),
  limit: jest.fn().mockImplementation(() => genericProvider),
  exec: jest.fn(),
};

describe('Test SearchService', () => {
  let searchService;
  let criteria = {};
  let projections = {};
  let options = {};
  let theTenantId = 1;
  let page = 3;
  let pageSize = 30;
  beforeEach(() => {
    jest.clearAllMocks();
    searchService = new SearchService(
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
      genericProvider,
    );
  });

  it('test search: tenantModel', async () => {
      genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'tenantModel'}));
      let result = await searchService.find('tenants', criteria, projections, options, theTenantId, page, pageSize );
      expect(result).toEqual({provider: 'tenantModel'});
      expect(genericProvider.find).toBeCalledTimes(1);
      expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

      expect(genericProvider.skip).toBeCalledTimes(1);
      expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

      expect(genericProvider.limit).toBeCalledTimes(1);
      expect(genericProvider.limit).toBeCalledWith(pageSize);

      expect(genericProvider.exec).toBeCalledTimes(1);
      expect(genericProvider.exec).toBeCalledWith();
  });


  it('test search: userModel', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'userModel'}));
    let result = await searchService.find('users', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'userModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: invitationModel', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'invitationModel'}));
    let result = await searchService.find('invitations', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'invitationModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: dsConnectionModel', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'dsConnectionModel'}));
    let result = await searchService.find('connections', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'dsConnectionModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: taskModel', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'taskModel'}));
    let result = await searchService.find('tasks', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'taskModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: clueModelModel', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'clueModelModel'}));
    let result = await searchService.find('models', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'clueModelModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: clueModelObjectModel', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'clueModelObjectModel'}));
    let result = await searchService.find('modelObjects', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'clueModelObjectModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: metadataTrackerProvider', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'metadataTrackerProvider'}));
    let result = await searchService.find('metadataTrackers', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'metadataTrackerProvider'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: subscriptionPlanProvider', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'subscriptionPlanProvider'}));
    let result = await searchService.find('subscriptions', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'subscriptionPlanProvider'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: datasetProvider', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'datasetProvider'}));
    let result = await searchService.find('datasets', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'datasetProvider'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: vizBookProvider', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'vizBookProvider'}));
    let result = await searchService.find('visualizations', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'vizBookProvider'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: vizPageProvider', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'vizPageProvider'}));
    let result = await searchService.find('visualizationPages', criteria, projections, options, theTenantId, page, pageSize );
    expect(result).toEqual({provider: 'vizPageProvider'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});

it('test search: tenantModel without tenantId', async () => {
    genericProvider.exec.mockReturnValueOnce(Promise.resolve({provider: 'tenantModel'}));
    let result = await searchService.find('tenants', criteria, projections, options, null, page, pageSize );
    expect(result).toEqual({provider: 'tenantModel'});
    expect(genericProvider.find).toBeCalledTimes(1);
    expect(genericProvider.find).toBeCalledWith(criteria, projections, options);

    expect(genericProvider.skip).toBeCalledTimes(1);
    expect(genericProvider.skip).toBeCalledWith((page - 1) * pageSize);

    expect(genericProvider.limit).toBeCalledTimes(1);
    expect(genericProvider.limit).toBeCalledWith(pageSize);

    expect(genericProvider.exec).toBeCalledTimes(1);
    expect(genericProvider.exec).toBeCalledWith();
});


});
