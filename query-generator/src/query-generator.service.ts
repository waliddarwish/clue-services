import { Injectable, Inject } from '@nestjs/common';
import { AbstractQueryGenerator } from './generators/generator.base';
import { GeneratorStateMachine } from './state-machine/GeneratorStateMachine';
import queryGeneratorFactory = require('./generators/generator.factory')
import { ClueModel, ClueModelObject, DataSourceConnection, Dataset } from '../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { QueryDefinition } from '../../object-schema/src/schemas/query-definition';
import { LogService } from '../../log-module/src/log.service';
import { DatasetObject } from '../../object-schema/src/schemas/catalog.dataset';

@Injectable()
export class QueryGeneratorService {


  constructor(
    @Inject('modelObjectProvider') private readonly modelObjectProvider: Model<ClueModelObject>,
    @Inject('modelProvider') private readonly modelProvider: Model<ClueModel>,
    @Inject('datasourceConnectionProvider') private readonly dsConnectionModel: Model<DataSourceConnection>,
    @Inject('datasetProvider') private readonly datasetProvider: Model<Dataset>,
    private readonly logService: LogService
  ) { }



  async generateQuery(queryDefinition: any, models: any[], connections: any[], datasets: DatasetObject[]): Promise<any> {
    const generator: AbstractQueryGenerator = queryGeneratorFactory.instantiateWithConnection(connections, models, queryDefinition, this.logService, datasets);
    if (generator) {
      let generatorStateMachine: GeneratorStateMachine = new GeneratorStateMachine(generator);
      generatorStateMachine.startStateMachine();
      return { status: generator.generatorState.result, data: generator.generatorState.query };

    } else {
      return { status: -1, data: 'Failed to instantiate generator' };
    }
  }

  async generateGraphByModelId(clueModelId: string): Promise<any> {
    let clueModelObjects: ClueModelObject[] = [];
    return this.modelObjectProvider.find({ clueModelId }).exec().then(
      (theClueModelObjects) => {
        clueModelObjects = theClueModelObjects;
        return this.generateGraphForModelObjects(clueModelObjects);
      }
    ).catch(error => {
      throw error;
    });
  }

  /**
   * 1. Get model objects from user input. 
   * 2. Get all model objects using model id from one of the retrieved items in step 1. 
   * 3. Loop over the the list and try to find all objects where its not part of the user input and its 
   * connected to one of the tables in the user input. i.e: modelobject fk => user input PK. 
   * @param clueModelObjectsIds 
   */
  async generateGraphByModelObjectIds(clueModelObjectsIds: string[]): Promise<any> {
    const clueModelObjects: ClueModelObject[] = [];
    const clueModelObjectPrimaryKeys: string[] = [];


    for (const clueModelObjectId of clueModelObjectsIds) {
      const theModelObject = await this.modelObjectProvider.findOne({ "id": clueModelObjectId }).exec();
      
      clueModelObjects.push(theModelObject);
      for (const modelObjectItem of theModelObject.modelObjectItems) {
        if (modelObjectItem.isPrimaryKey) {
          clueModelObjectPrimaryKeys.push(modelObjectItem.nameInDatasource);
        }
      }
    }

    const focusedNodeId = clueModelObjects[0].nameInDatasource;



    const allModelObjects: ClueModelObject[] = await this.modelObjectProvider.find({ clueModelId: clueModelObjects[0].clueModelId }).exec();
    for (const modelObject of allModelObjects) {
      if (clueModelObjectsIds.indexOf(modelObject.id) === -1) {
        for (const modelObjectItem of modelObject.modelObjectItems) {
          if (modelObjectItem.isForeignKey) {
            const foreignReference = modelObjectItem.foreignTableSchema + '.' +
              modelObjectItem.foreignTableName + '.' + modelObjectItem.foreignTableColumnName;
            // console.log("foreignReference " + foreignReference);

            if (clueModelObjectPrimaryKeys.indexOf(foreignReference) !== -1) {
              // console.log("Adding " + modelObject.nameInDatasource + " to the clueModelObject list")
              clueModelObjects.push(modelObject);
            }

          }
        }
      }
    }

    return this.generateGraphForModelObjects(clueModelObjects, focusedNodeId);
  }

  async generateGraphForModelObjects(clueModelObjects: ClueModelObject[], focusedNodeId?: string): Promise<any> {
    const connectionObjects: DataSourceConnection[] = [];
    const connectionIdArray = [];
    const datasetIdArray = [];
    const datasetArray = [];

    for (const theModelObject of clueModelObjects) {
      const theGreatModel = await this.modelProvider.findOne({ "id": theModelObject.clueModelId }).exec();
      let connectionType = '';
      for (const connection of theGreatModel.datasources) {
        if (connection.datasourceId == theModelObject.dataSourceConnectionId) {
          connectionType = connection.datasourceType;
          break;
        }
      }

      if (connectionType === 'DatabaseConnection') {
        const theConnectionObj = await this.dsConnectionModel.find({ "id": theModelObject.dataSourceConnectionId }).exec();
        if (connectionIdArray.indexOf(theConnectionObj[0].id) === -1) {
          connectionIdArray.push(theConnectionObj[0].id);
          connectionObjects.push(theConnectionObj[0]);
        }
      } else if (connectionType === 'Dataset') {
        const theDatasetObj = await this.datasetProvider.findOne({ "id": theModelObject.dataSourceConnectionId }).exec();
        if (datasetIdArray.indexOf(theDatasetObj.id) === -1) {
          datasetIdArray.push(theDatasetObj.id);
          datasetArray.push(theDatasetObj);
        }
      } else {
        //TODO return 
      }
    }


    const generator: AbstractQueryGenerator = queryGeneratorFactory.instantiateWithConnection(connectionObjects,
      clueModelObjects, new QueryDefinition(), this.logService, datasetArray);
    generator.generatorState.wrapColumnNameInDoubleQuotes = false;
    generator.getModelGraph();

    if (generator.generatorState.result === 0) {
      if (focusedNodeId) {
        const graph = generator.generatorState.serialezedTableGraph;
        return { status: 0, data: { focusedNodeId, graph } };
      } else {
        return { status: 0, data: generator.generatorState.serialezedTableGraph };
      }
    } else {
      return { status: generator.generatorState.result, data: generator.generatorState.resultMessage };
    }
  }
}
