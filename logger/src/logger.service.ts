import { Injectable, Logger } from '@nestjs/common';
import { LogEntry, LoggerSchema } from '../../log-module/src/log.schema';
import { Connection, Model } from 'mongoose';

@Injectable()
export class LoggerService {

  private logger = new Logger('LoggerService')

  private logModel: Model<LogEntry>;

  initService(connection: Connection) {
    this.logModel = connection.model('LogEntry', LoggerSchema);
  }

  async log(logEntry: LogEntry): Promise<any> {
    return this.logModel.create(logEntry);
  }

  async cleanLogs(startDate: any, endDate: any): Promise<any> {

    return this.logModel.deleteMany({ timestamp: { $gte: startDate, $lte: endDate } }).catch((err) => {
      this.logger.error(err);
    });
  }
}
