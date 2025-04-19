import { Test } from '@nestjs/testing';
import { ConnectionTestService } from './connection-test.service';
import { HttpServer, HttpService } from '@nestjs/common';
import { DataSourceConnectionObject } from '../../object-schema/src/schemas/catalog.connection';

const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn()
};



describe("Test ConnectionTestModule", () => {
    let httpService;
    let connectionTestService;
    let dataSourceConnectionObject = new DataSourceConnectionObject();



    describe('ConnectionTestService.testConnection', () => {
        beforeEach(async () => {
            const module = await Test.createTestingModule({
                providers: [
                    ConnectionTestService,
                    { provide: HttpService, useFactory: () => { return mockHttpService } }
                ],

            }).compile();

            httpService = await module.get<HttpService>(HttpService);

            connectionTestService = await module.get<ConnectionTestService>(ConnectionTestService);

        });

        it("Expect success  ", () => {
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue({ data: "Success" });
            expect(connectionTestService.testConnection(dataSourceConnectionObject)).resolves.toEqual("Success");
            expect(httpService.post).toBeCalledWith('http://' + 'connection-tester' + ':' + '8340'
                + '/connection-test', dataSourceConnectionObject);
        });

        it("Expect success  ", () => {
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue({ result: 'Internal Error' });
            expect(connectionTestService.testConnection(dataSourceConnectionObject)).resolves.toEqual({ result: 'Internal Error' });
            expect(httpService.post).toBeCalledWith('http://' + 'connection-tester' + ':' + '8340'
                + '/connection-test', dataSourceConnectionObject);
        })

    });
});