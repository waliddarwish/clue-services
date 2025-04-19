import { Test } from '@nestjs/testing';
import { OracleQueryExecutorImpl } from '../executors/executor-oracle';
import { PostgresQueryExecutorImpl } from '../executors/executor-postgres';
import { CockroachQueryExecutorImpl } from '../executors/executor-cockroach';
import { QueryDefinition } from '../../../object-schema/src/schemas/query-definition';
import queryExecutorFactory = require('../executors/executor.factory');
import { ConnectionTrackerService } from '../../../connection-tracking-module/src/connection-tracking.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { DatasetObject } from '../../../object-schema/src/schemas/catalog.dataset';



describe('Test query executor factory', () => {

    let queryString = 'select bla from bla';
    let connections = [];
    let oracleConnection = {connectionType: 'Oracle'};
    let postgresConnection = {connectionType: 'Postgres'};
    let dataset: DatasetObject[] = [];
    let queryDefinition = new QueryDefinition;
    let models = [];
    let mockConnectionTrackerService = {};
    let mockAuthenticationService = {};
    let connectionTrackerService;
    let authenticationService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: ConnectionTrackerService, useFactory: () => { return mockConnectionTrackerService } },
                { provide: AuthenticationService, useFactory: () => { return mockAuthenticationService } },
     
            ]
        }).compile();
        connectionTrackerService = await module.get<ConnectionTrackerService>(ConnectionTrackerService);
        authenticationService = await module.get<AuthenticationService>(AuthenticationService);

        jest.genMockFromModule('../executors/executor-oracle');
        jest.mock('../executors/executor-oracle');

        jest.genMockFromModule('../executors/executor-postgres');
        jest.mock('../executors/executor-postgres');

        jest.genMockFromModule('../executors/executor-cockroach');
        jest.mock('../executors/executor-cockroach');


    });

    it('instantiate oracle executor', ()=> {
        let connections = [];
        connections.push(oracleConnection);
        connections.push(postgresConnection);

        let result = queryExecutorFactory.instantiateExecutor(queryString, connections, queryDefinition,[], connectionTrackerService, authenticationService, [], {}, {});
        expect(result.executorState.connectionType).toEqual('Oracle');
        expect(result.executorState.models).toEqual(models);
        expect(result.executorState.queryFromGenerator).toEqual(queryString);
        expect(result.executorState.connections).toEqual(connections);
        expect(result.executorState.queryDefinition).toEqual(queryDefinition);
    });

    it('instantiate postgres executor', ()=> {
        let connections = [];
        connections.push(postgresConnection);
        connections.push(oracleConnection);


        let result = queryExecutorFactory.instantiateExecutor(queryString, connections, queryDefinition,[], connectionTrackerService, authenticationService, [], {}, {});
        expect(result.executorState.connectionType).toEqual('Postgres');
        expect(result.executorState.models).toEqual(models);
        expect(result.executorState.queryFromGenerator).toEqual(queryString);
        expect(result.executorState.connections).toEqual(connections);
        expect(result.executorState.queryDefinition).toEqual(queryDefinition);
    });

    it('instantiate cockroach executor', ()=> {
        let dbObject = new DatasetObject();
        dbObject.id = '234';
        dataset.push(dbObject);


        let result = queryExecutorFactory.instantiateExecutor(queryString, connections, queryDefinition,[], connectionTrackerService, authenticationService, dataset, {}, {});
        expect(result.executorState.connectionType).toEqual('Cockroach');
        expect(result.executorState.models).toEqual(models);
        expect(result.executorState.queryFromGenerator).toEqual(queryString);
        expect(result.executorState.connections).toEqual(connections);
        expect(result.executorState.queryDefinition).toEqual(queryDefinition);
    });

    it('Return null', ()=> {

        let result = queryExecutorFactory.instantiateExecutor(queryString, [], queryDefinition,[], connectionTrackerService, authenticationService, [], {}, {});
        expect(result).toEqual(null);
    });
});