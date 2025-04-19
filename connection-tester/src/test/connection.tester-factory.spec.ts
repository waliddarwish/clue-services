
import connectionTesterFactory = require('../connection.tester-factory');
import { OracleConnectionTester } from '../connection.oracler-tester';
import { PostgresConnectionTester } from '../connection.postgres-tester';
import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';


describe('Test connection.tester-factory', () => {
    let connection = {
        connectionType: ''
    };
    let authService;

    beforeEach(async () => {

        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                { provide: AuthenticationService, useFactory: () => { return {} } },

            ]
        }).compile();

        authService = await module.get<AuthenticationService>(AuthenticationService);

    })

    it('test instantiate oracle connection test', ()=>{
        connection.connectionType = 'Oracle';
        let tester = connectionTesterFactory.default(connection, authService);
        expect(tester).toEqual(new OracleConnectionTester(connection, authService));
    });

    it('test instantiate Postgres connection test', ()=>{
        connection.connectionType = 'Postgres';
        let tester = connectionTesterFactory.default(connection, authService);
        expect(tester).toEqual(new PostgresConnectionTester(connection, authService));
    });

    it('test instantiate with null connection', ()=>{
        connection.connectionType = '';
        let tester = connectionTesterFactory.default(connection, authService);
        expect(tester).toEqual(null);
    });

});
