import { Test } from '@nestjs/testing';
import { MetadataCoordinationService } from '../../../metadata-coordination-module/src/metadata-coordination.service';
import { MetadataService } from './metadata.service';
import uuid from 'uuid';


let dsConnectionModel;
let modelProvider;
let datasetDataFileProvider;
let metadataTrackerProvider;
let modelObjectProvider;
let metadataCoordinationService;
let metadataCoordinationServiceMocked = {
  getSchemaObjects: jest.fn(),
  importModel: jest.fn(),
  getSchemas: jest.fn(),
};

let metadataService;

describe('Test MetadataService ', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: MetadataCoordinationService,
          useFactory: () => {
            return metadataCoordinationServiceMocked;
          },
        },
      ],
    }).compile();

    metadataCoordinationService = await module.get<MetadataCoordinationService>(
      MetadataCoordinationService,
    );

    dsConnectionModel = {
      findOne: jest.fn().mockImplementation(() => dsConnectionModel),
      exec: jest.fn(),
    };
    modelProvider = {
      findOne: jest.fn().mockImplementation(() => modelProvider),
      exec: jest.fn(),
    };
    datasetDataFileProvider = {
      findOne: jest.fn().mockImplementation(() => datasetDataFileProvider),
      aggregate: jest.fn().mockImplementation(() => datasetDataFileProvider),
      match: jest.fn().mockImplementation(() => datasetDataFileProvider),
      project: jest.fn().mockImplementation(() => datasetDataFileProvider),
      exec: jest.fn(),
    };
    metadataTrackerProvider = {
      update: jest.fn().mockImplementation(() => metadataTrackerProvider),
      find: jest.fn().mockImplementation(() => metadataTrackerProvider),
      aggregate: jest.fn().mockImplementation(() => metadataTrackerProvider),
      exec: jest.fn(),
    };
    modelObjectProvider = {
      findOne: jest.fn().mockImplementation(() => modelObjectProvider),
      exec: jest.fn(),
    };

    metadataService = new MetadataService(
      dsConnectionModel,
      modelProvider,
      datasetDataFileProvider,
      metadataTrackerProvider,
      modelObjectProvider,
      metadataCoordinationService,
    );
    

  });


  it('test getDatabaseObjects scenario 1', async () => {
    let datasourceType = 'Dataset';
    datasetDataFileProvider.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
    let result = await metadataService.getDatabaseObjects('connectionId', datasourceType, 'schema', 'tenantId');
    expect(result).toEqual({"data": {name: 'hello'}});
    expect(datasetDataFileProvider.aggregate).toBeCalledWith();
    expect(datasetDataFileProvider.match).toBeCalledWith({datasetId : 'connectionId'});
    expect(datasetDataFileProvider.project).toBeCalledWith({ 
        "id" : '$id',
        "object_name": { $concat: [ "$fileName", " - ", "$prettyName" ] },
        "object_type": 'Data File'
      });
  });

  it('test getDatabaseObjects scenario 2', async () => {
    let datasourceType = 'Database';
    dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({name: 'hello'}));
    metadataCoordinationService.getSchemaObjects.mockReturnValueOnce(Promise.resolve({name: 'hello2'}));
    let result = await metadataService.getDatabaseObjects('connectionId', datasourceType, 'schema', 'theTenantId');
    expect(result).toEqual({name: 'hello2'});
    expect(dsConnectionModel.findOne).toBeCalledWith({ id: 'connectionId', tenantId: 'theTenantId' });
    expect(metadataCoordinationServiceMocked.getSchemaObjects).toBeCalledWith({name: 'hello'}, 'schema');

  });

  it('test getDatabaseObjects scenario 3', async () => {
    let datasourceType = 'Database';
    dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(null));
    expect(metadataService.getDatabaseObjects('connectionId', datasourceType, 'schema', 'theTenantId')).rejects.toEqual(new Error('Connection not found'));
  });

  it('test getSchemas scenario 1', async () => {
    dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve({}));
    metadataCoordinationServiceMocked.getSchemas.mockReturnValue({name: "hello3"});
    let result = await metadataService.getSchemas('connId', 'tenantId');
    expect(result).toEqual({name: 'hello3'});
  });

  it('test getDatabaseObjects scenario 2', async () => {
    dsConnectionModel.exec.mockReturnValueOnce(Promise.resolve(null));
    expect(metadataService.getSchemas('connId', 'tenantId')).rejects.toEqual(new Error('Connection not found'));
  });

  it('test importStatus', async () => {
    metadataTrackerProvider.find.mockReturnValueOnce(Promise.resolve({}));
    let result = await metadataService.importStatus('connId');
    expect(result).toEqual({});
  });

  it('test importStatusByModel', async () => {
    metadataTrackerProvider.find.mockReturnValueOnce(Promise.resolve({}));
    let result = await metadataService.importStatusByModel('connId');
    expect(result).toEqual({});
  });


  it('test collectiveStatus', async () => {
    metadataTrackerProvider.exec.mockReturnValueOnce(Promise.resolve({}));
    let result = await metadataService.collectiveStatus('theModelId');
    expect(result).toEqual({});
    expect(metadataTrackerProvider.aggregate).toBeCalledWith(      [
        {
          $match:  { clueModelId: 'theModelId'}
        } ,
        { $group: { _id : "$status"   , Count: { $sum: 1 } } },
      ]);
  });


  describe('Test importMetadata' , () => {
    let newTracker = {}; 
    let modelId = '1245';
    let theTenantId = '67889';
    let theUserId = '37454';
    let defaultModelObject = {
        name: 'name', 
        nameInDatasource: 'nameInDatasource',
        userId: 'userId',
        tenantId: 'tenantId',
        dataSourceConnectionId: 'dataSourceConnectionId',
        type: 'type',
        source: 'source',
        schemata: 'schemata',
        datasetDatafileId: 'datasetDatafileId',
        modelObjectItems: [{}]
    };



    beforeEach(async () => {

        metadataTrackerProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return newTracker }),
                save: jest.fn().mockReturnValue(Promise.resolve(newTracker)),
            }});
        metadataTrackerProvider.save = jest.fn().mockReturnValue(metadataTrackerProvider);
        metadataTrackerProvider.update = jest.fn().mockReturnValue(metadataTrackerProvider);
        metadataTrackerProvider.exec = jest.fn().mockReturnValue(Promise.resolve({ name: 'hello' })),



        modelObjectProvider = jest.fn().mockImplementation(() => {
            return {
                newObj: jest.fn().mockImplementation(() => { return defaultModelObject }),
                save: jest.fn().mockReturnValue(Promise.resolve(defaultModelObject)),
            }
        });
        modelObjectProvider.update = jest.fn().mockReturnValue(modelObjectProvider),
        modelObjectProvider.findOne = jest.fn().mockReturnValue(modelObjectProvider),
        modelObjectProvider.exec = jest.fn().mockReturnValue(Promise.resolve(defaultModelObject))

        metadataService = new MetadataService(
            dsConnectionModel,
            modelProvider,
            datasetDataFileProvider,
            metadataTrackerProvider,
            modelObjectProvider,
            metadataCoordinationService,
          );
    });

    it('test importMetadata scenario 1', async() => {
        let findModelResult = {id: '8464383'};
        let importSpecs = [
            {
                connectionId: '8364544', 
                objects: [
                    {
                        objectName: 'public.table.column' 
                    }
                ]
            }
        ];
        let datasourceMap = [];
        datasourceMap['8364544'] = 'database';
        modelProvider.exec.mockReturnValueOnce(Promise.resolve(findModelResult));
        
        
        await metadataService.importMetadata(modelId, importSpecs, datasourceMap, theTenantId, theUserId);
        expect(metadataCoordinationService.importModel).toBeCalledWith({"id": "8464383"}, [{"connectionId": "8364544", "objects": [{"objectName": "public.table.column"}]}], "67889", "37454", expect.anything());
    
    });

    it('test importMetadata scenario 1', async() => {
        let findModelResult = {id: '8464383'};
        let importSpecs = [
            {
                connectionId: '8364544', 
                objects: [
                    {
                        objectId : '1384347',
                        objectName: 'public.table.column' 
                    }
                ]
            }
        ];
        let datasourceMap = [];
        datasourceMap['8364544'] = 'Dataset';
        modelProvider.exec.mockReturnValueOnce(Promise.resolve(findModelResult));
        const v1Spy = jest.spyOn(uuid, 'v4').mockReturnValue('testId');

        
        await metadataService.importMetadata(modelId, importSpecs, datasourceMap, theTenantId, theUserId);
        /* expect(metadataTrackerProvider.update.mock.calls).toMatchSnapshot( [
             [
               {
                "dataSourceConnectionId": "8364544",
                "objectName": "public.table.column",
                "trackingId": expect.any(String),
              },
               {
                "status": "In Progress",
              },
            ],
             [
               {
                "dataSourceConnectionId": "8364544",
                "objectName": "public.table.column",
                "trackingId": expect.any(String)
              },
               {
                "errorMessage": "{}",
                "status": "Error",
              },
            ],
        ]);*/
        expect(modelObjectProvider.findOne).toBeCalledWith({datasetDatafileId: '1384347'});

    });

    

  });





  
});
