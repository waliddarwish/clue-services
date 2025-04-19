import { ConnectionTrackerService } from './connection-tracking.service';
import sleepAsync = require('sleep-async');
sleepAsync.sleep = jest.fn();

describe('Test Connection tracking module', () => {
  let dsConnectionModel = {
    exec: jest.fn(),
    findOneAndUpdate: jest.fn().mockImplementation(() => dsConnectionModel),
  };

  let clueSettingsModel = {
    exec: jest.fn(),
    findOne: jest.fn().mockImplementation(() => clueSettingsModel),
  };

  let tenantModel = {
    exec: jest.fn(),
    findOne: jest.fn().mockImplementation(() => tenantModel),
    findOneAndUpdate: jest.fn().mockImplementation(() => tenantModel),
  };

  let planModel = {
    exec: jest.fn(),
    findOne: jest.fn().mockImplementation(() => planModel),
  };

  let connectionTrackerService;
  beforeEach(async () => {
    connectionTrackerService = new ConnectionTrackerService(
      dsConnectionModel,
      clueSettingsModel,
      planModel,
      tenantModel,
    );
  });

  describe('Test API functions', () => {
    beforeEach(() => {
      connectionTrackerService.acquireConnectionsInternal = jest.fn();
      connectionTrackerService.releaseConnectionsInternal = jest.fn();
      connectionTrackerService.acquireDatasetStoreConnectionsInternal = jest.fn();
      connectionTrackerService.releaseDatasetStoreConnectionsInternal = jest.fn();
    });

    it('test acquireConnections succes ', async () => {
      connectionTrackerService.acquireConnectionsInternal.mockResolvedValue(3);
      let result = await connectionTrackerService.acquireConnections(
        'Some connection id ',
        3,
      );
      expect(result).toEqual(3);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledWith('Some connection id ', 3, 'dataConnectionCount');
    });

    it('test acquireConnections failure ', async () => {
      connectionTrackerService.acquireConnectionsInternal.mockResolvedValue(0);
      let result = await connectionTrackerService.acquireConnections(
        'Some connection id ',
        3,
      );
      expect(result).toEqual(0);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledWith('Some connection id ', 3, 'dataConnectionCount');
    });

    it('test acquireMetadataConnections succes ', async () => {
      connectionTrackerService.acquireConnectionsInternal.mockResolvedValue(3);
      let result = await connectionTrackerService.acquireMetadataConnections(
        'Some connection id ',
        3,
      );
      expect(result).toEqual(3);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledWith(
        'Some connection id ',
        3,
        'metadataConnectionCount',
      );
    });

    it('test acquireMetadataConnections failure ', async () => {
      connectionTrackerService.acquireConnectionsInternal.mockResolvedValue(0);
      let result = await connectionTrackerService.acquireMetadataConnections(
        'Some connection id ',
        3,
      );
      expect(result).toEqual(0);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.acquireConnectionsInternal,
      ).toHaveBeenCalledWith(
        'Some connection id ',
        3,
        'metadataConnectionCount',
      );
    });

    it('test releaseConnections succes ', async () => {
      connectionTrackerService.releaseConnectionsInternal.mockResolvedValue(3);
      let result = await connectionTrackerService.releaseConnections(
        'Some connection id ',
        3,
      );
      expect(result).toEqual(3);
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledWith('Some connection id ', 3, 'dataConnectionCount');
    });

    it('test releaseConnections failure ', async () => {
      connectionTrackerService.acquireConnectionsInternal.mockRejectedValue({
        error: 'Some Error',
      });
      expect(
        await connectionTrackerService.releaseConnections(
          'Some connection id ',
          3,
        ),
      ).rejects;
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledWith('Some connection id ', 3, 'dataConnectionCount');
    });

    it('test releaseMetadataConnections succes ', async () => {
      connectionTrackerService.releaseConnectionsInternal.mockResolvedValue(3);
      let result = await connectionTrackerService.releaseMetadataConnections(
        'Some connection id ',
        3,
      );
      expect(result).toEqual(3);
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledWith(
        'Some connection id ',
        3,
        'metadataConnectionCount',
      );
    });

    it('test releaseMetadataConnections failure ', async () => {
      connectionTrackerService.acquireConnectionsInternal.mockRejectedValue({
        error: 'Some Error',
      });
      expect(
        await connectionTrackerService.releaseMetadataConnections(
          'Some connection id ',
          3,
        ),
      ).rejects;
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.releaseConnectionsInternal,
      ).toHaveBeenCalledWith(
        'Some connection id ',
        3,
        'metadataConnectionCount',
      );
    });

    it('test acquireDatasetStoreConnections succes ', async () => {
      connectionTrackerService.acquireDatasetStoreConnectionsInternal.mockResolvedValue(
        3,
      );
      let result = await connectionTrackerService.acquireDatasetStoreConnections(
        'Some Tenant id',
        3,
      );
      expect(result).toEqual(3);
      expect(
        connectionTrackerService.acquireDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.acquireDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledWith('Some Tenant id', 3);
    });

    it('test acquireDatasetStoreConnections failure ', async () => {
      connectionTrackerService.acquireDatasetStoreConnectionsInternal.mockResolvedValue(
        0,
      );
      let result = await connectionTrackerService.acquireDatasetStoreConnections(
        'Some tenant id',
        3,
      );
      expect(result).toEqual(0);
      expect(
        connectionTrackerService.acquireDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.acquireDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledWith('Some tenant id', 3);
    });

    it('test releaseDatasetStoreConnections succes ', async () => {
      connectionTrackerService.releaseDatasetStoreConnectionsInternal.mockResolvedValue(
        3,
      );
      let result = await connectionTrackerService.releaseDatasetStoreConnections(
        'Some tenant id',
        3,
      );
      expect(result).toEqual(3);
      expect(
        connectionTrackerService.releaseDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.releaseDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledWith('Some tenant id', 3);
    });

    it('test releaseDatasetStoreConnections failure ', async () => {
      connectionTrackerService.releaseDatasetStoreConnectionsInternal.mockRejectedValue(
        {
          error: 'Some Error',
        },
      );

      expect(
        connectionTrackerService.releaseDatasetStoreConnections(
          'Some tenant id',
          3,
        ),
      ).toThrow;
      expect(
        connectionTrackerService.releaseDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledTimes(1);
      expect(
        connectionTrackerService.releaseDatasetStoreConnectionsInternal,
      ).toHaveBeenCalledWith('Some tenant id', 3);
    });
  });

  describe('Test Internal functions', () => {
    beforeEach(() => {
      dsConnectionModel = {
        exec: jest.fn(() => Promise.resolve({ data: {} })),
        findOneAndUpdate: jest.fn().mockImplementation(() => dsConnectionModel),
        findOne: jest.fn().mockImplementation(() => dsConnectionModel),
      };
      connectionTrackerService = new ConnectionTrackerService(
        dsConnectionModel,
        clueSettingsModel,
        planModel,
        tenantModel,
      );
    });

    it('Test releaseConnectionsInternal success scenario 1', async () => {
      let result = await connectionTrackerService.releaseConnectionsInternal(
        'Some connection id',
        3,
        'dataConnectionCount',
      );
      expect(result).toEqual(3);
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'Some connection id' },
        { $inc: { ['dataConnectionCount']: -3 } },
      );
    });

    it('Test releaseConnectionsInternal success scenario 2', async () => {
      let result = await connectionTrackerService.releaseConnectionsInternal(
        'Some connection id',
        3,
        'metadataConnectionCount',
      );
      expect(result).toEqual(3);
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'Some connection id' },
        { $inc: { ['metadataConnectionCount']: -3 } },
      );
    });

    it('Test releaseConnectionsInternal failure scenario', async () => {
      dsConnectionModel.exec.mockImplementation(() => {
        Promise.reject('Some Error');
      });
      expect(
        await connectionTrackerService.releaseConnectionsInternal(
          'Some connection id',
          3,
          'metadataConnectionCount',
        ),
      ).rejects;
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'Some connection id' },
        { $inc: { ['metadataConnectionCount']: -3 } },
      );
      expect(dsConnectionModel.exec).toHaveBeenCalledTimes(1);
    });

    it('Test acquireConnectionInternal success scenario 1', async () => {
      dsConnectionModel.exec.mockResolvedValue({
        maxAcquireConnectionRetry: 5,
        acquireConnectionSleepDuration: 10,
      });
      let result = await connectionTrackerService.acquireConnectionsInternal(
        'Some connection id',
        3,
        'dataConnectionCount',
      );
      expect(result).toEqual(3);
      expect(dsConnectionModel.findOne).toHaveBeenCalledTimes(1);
      expect(dsConnectionModel.findOne).toHaveBeenCalledWith({
        id: 'Some connection id',
      });
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('Test acquireConnectionInternal success scenario 2', async () => {
      dsConnectionModel.exec.mockResolvedValue({
        maxAcquireConnectionRetry: 5,
        acquireConnectionSleepDuration: 10,
      });
      let result = await connectionTrackerService.acquireConnectionsInternal(
        'Some connection id',
        3,
        'metadataConnectionCount',
      );
      expect(result).toEqual(3);
      expect(dsConnectionModel.findOne).toHaveBeenCalledTimes(1);
      expect(dsConnectionModel.findOne).toHaveBeenCalledWith({
        id: 'Some connection id',
      });
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });
    it('Test acquireConnectionInternal success scenario 3', async () => {
      dsConnectionModel.exec
        .mockResolvedValueOnce({
          maxAcquireConnectionRetry: 3,
          acquireConnectionSleepDuration: 10,
        })
        .mockRejectedValueOnce({ error: 'Some Error' })
        .mockResolvedValueOnce({});
      let result = await connectionTrackerService.acquireConnectionsInternal(
        "Some connection id that doesn't exist",
        3,
        'metadataConnectionCount',
      );
      expect(result).resolves;
      expect(result).toEqual(3);
      expect(dsConnectionModel.findOne).toHaveBeenCalledTimes(1);
    });

    it('Test acquireConnectionInternal failure scenario 1', async () => {
      dsConnectionModel.exec.mockRejectedValue({ error: 'Some error' });
      expect(
        connectionTrackerService.acquireConnectionsInternal(
          "Some connection id that doesn't exist",
          3,
          'metadataConnectionCount',
        ),
      ).rejects;
      expect(dsConnectionModel.findOne).toHaveBeenCalledTimes(1);
      expect(dsConnectionModel.findOneAndUpdate).toHaveBeenCalledTimes(0);
    });

    it('Test acquireConnectionInternal failure scenario 2', async () => {
      dsConnectionModel.exec
        .mockResolvedValueOnce({
          maxAcquireConnectionRetry: 3,
          acquireConnectionSleepDuration: 10,
        })
        .mockRejectedValueOnce({ error: 'Some Error' })
        .mockRejectedValueOnce({ error: 'Some Error' })
        .mockRejectedValueOnce({ error: 'Some Error' });
      let result = await connectionTrackerService.acquireConnectionsInternal(
        'Some connection id',
        3,
        'metadataConnectionCount',
      );
      expect(result).resolves;
      expect(result).toEqual(0);
      expect(dsConnectionModel.findOne).toHaveBeenCalledTimes(1);
    });

    it('Test acquireDatasetStoreConnectionsInternal success scenairo 1', async () => {
      clueSettingsModel.exec.mockResolvedValue({
        installationType: 'Multi-tenant',
        maxAcquireDatasetStoreConnectionRetry: 5,
        acquireDatasetStoreConnectionSleepDuration: 1000,
      });
      tenantModel.exec.mockResolvedValueOnce({
        subscriptionPlan: 'Some subscription plan',
      });
      planModel.exec.mockResolvedValue({ concurrency: 5 });
      tenantModel.exec.mockResolvedValueOnce({});
      let result = await connectionTrackerService.acquireDatasetStoreConnectionsInternal(
        'Some tenant Id',
        3,
      );
      expect(result).toEqual(3);
    });

    it('Test acquireDatasetStoreConnectionsInternal success scenairo 2', async () => {
      clueSettingsModel.exec.mockResolvedValue({
        installationType: 'Multi-tenant',
        maxAcquireDatasetStoreConnectionRetry: 5,
        acquireDatasetStoreConnectionSleepDuration: 1000,
      });
      tenantModel.exec.mockResolvedValueOnce({
        subscriptionPlan: 'Some subscription plan',
      });
      planModel.exec.mockResolvedValue({ concurrency: 5 });
      tenantModel.exec.mockResolvedValueOnce(null);
      tenantModel.exec.mockResolvedValueOnce({});
      let result = await connectionTrackerService.acquireDatasetStoreConnectionsInternal(
        'Some tenant Id',
        3,
      );
      expect(result).toEqual(3);
    });

    it('Test acquireDatasetStoreConnectionsInternal failure scenairo 1', async () => {
      clueSettingsModel.exec.mockResolvedValue({
        installationType: 'Multi-tenant',
        maxAcquireDatasetStoreConnectionRetry: 5,
        acquireDatasetStoreConnectionSleepDuration: 1000,
      });
      tenantModel.exec.mockResolvedValueOnce({
        subscriptionPlan: 'Some subscription plan',
      });
      planModel.exec.mockResolvedValue({ concurrency: 2 });
      tenantModel.exec.mockResolvedValueOnce(null);
      let result = await connectionTrackerService.acquireDatasetStoreConnectionsInternal(
        'Some tenant Id',
        3,
      );
      expect(result).toEqual(0);
    });

    it('Test acquireDatasetStoreConnectionsInternal failure scenairo 2', async () => {
      clueSettingsModel.exec.mockResolvedValue({
        installationType: 'Multi-tenant',
        maxAcquireDatasetStoreConnectionRetry: 5,
        acquireDatasetStoreConnectionSleepDuration: 1000,
      });
      tenantModel.exec.mockResolvedValue({});
      planModel.exec.mockResolvedValue(null);
      let result = await connectionTrackerService.acquireDatasetStoreConnectionsInternal(
        'Some tenant Id',
        3,
      );
      expect(result).toEqual(0);
    });

    it('Test acquireDatasetStoreConnectionsInternal failure scenairo 3', async () => {
      clueSettingsModel.exec.mockResolvedValue({
        installationType: 'Multi-tenant',
        maxAcquireDatasetStoreConnectionRetry: 5,
        acquireDatasetStoreConnectionSleepDuration: 1000,
      });
      tenantModel.exec.mockResolvedValue(null);
      let result = await connectionTrackerService.acquireDatasetStoreConnectionsInternal(
        'Some tenant Id',
        3,
      );
      expect(result).toEqual(0);
    });
  });
});
