import { Injectable, HttpService, Logger } from '@nestjs/common';
import { LogEntryObject } from './log.logentry';
import uuidv4 = require('uuid/v4');

@Injectable()
export class LogService {
  private logger = new Logger('LogService');

  constructor(private readonly httpService: HttpService) {

  }

  async log(loggerName: string, logLevel: string, logMessage: string, theMessageType: string, logSession?: string, logRequest?: string, theTenantId?: string, theUserId?: string, theDuration?: number, theCallRoute?:string) {
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
        this.httpService.put('http://' + 'logger' + ':' + '8280' + '/sa-logger/log' , logEntry).toPromise().catch( (err) => {
          // Unable to send the message to logger, just dump it to console.
          // tslint:disable-next-line: no-console
          this.logger.log(logEntry);
        });
  }

  async cleanLogs (startDate:any, endDate:any, tenantId?:string): Promise<any> {
   
        return this.httpService.put('http://' + 'logger' + ':' + '8280'
          + '/sa-logger/clean-log', { startDate, endDate }).toPromise().then((result: any) => {
            return result.data;
          }).catch((error) => {
            return { result: 'Internal Error' + JSON.stringify(error) };
          });
    
  }
}
