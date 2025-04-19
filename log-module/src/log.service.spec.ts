import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { LogService } from './log.service';
import { LogEntryObject } from './log.logentry';
import { puts } from 'util';
import uuidv4 = require('uuid/v4');

jest.mock('uuid/v4');
const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn(),
    put: jest.fn()
};


describe('Test log module', () => {
    let httpService;
    let logService;

    beforeAll(() => {
        global.Date.now = jest.fn(() => new Date('2019-04-07T10:20:30Z').getTime())
      })
      
      afterAll(() => {
        global.Date.now = Date.now
      })

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                LogService,
                { provide: HttpService, useFactory: () => { return mockHttpService } },
            ]
        }).compile();
        httpService = await module.get<HttpService>(HttpService);
        logService = await module.get<LogService>(LogService);
    });


    it('will log successfully', () => {
        let loggerName = 'logger';
        let logLevel = 'info'
        let logMessage = 'hello';
        let theMessageType = 'message type';
        let logSession = '123456767';
        let logRequest = 'clue request';
        let theTenantId = '12345678'; 
        let theUserId = '149t86'
        let theDuration = 56;
        let theCallRoute = 'logController.log';

        uuidv4.mockImplementation(() => 'testid');
    
        const logEntry: LogEntryObject = {
            id :  uuidv4(),
            level : logLevel,
            message : logMessage,
            timestamp : new Date().getTime(),
            logger: loggerName,
            sessionId : logSession,
            requestId: logRequest, 
            messageType: theMessageType, 
            tenantId: theTenantId,
            userId: theUserId,
            duration: theDuration, 
            callRoute: theCallRoute
      
            };
        
        let result = {
            data: {
                status: 0,
                message: "successful",
                data: "logged message"
            }
        };

        httpService.put.mockImplementation(() => mockObservable);
        mockObservable.toPromise.mockResolvedValue(result);
        expect(logService.log(loggerName, logLevel, logMessage, theMessageType, logSession, logRequest, theTenantId, theUserId, theDuration, theCallRoute)).resolves;
        expect(httpService.put).toBeCalledWith('http://' + 'logger' + ':' + '8280' + '/sa-logger/log' , logEntry);
    });

});