
import config = require('config/config.json');
import { LogService } from '../../../log-module/src/log.service';

export class LogCleanerTask {

    constructor(private readonly logService: LogService) {

    }
    async executeTask(task: any): Promise<any> {
        const cleaningStartTimeStamp = task.cleaningRangeStart;
        const cleaningEndTimeStamp = task.cleaningRangeEnd;

        let cleaningRangeStart;
        let cleaningRangeEnd;
        // By default start range is sysdate - 
        if (!cleaningStartTimeStamp) {
            cleaningRangeStart = new Date();
            cleaningRangeStart.setDate(cleaningRangeStart.getDate() - parseInt(config.LogCleanerTaskStartRange));
        } else {
            cleaningRangeStart = new Date();
            cleaningRangeStart.setTime(cleaningStartTimeStamp);
        }

        if (!cleaningEndTimeStamp) {
            cleaningRangeEnd = new Date();
            cleaningRangeEnd.setDate(cleaningRangeEnd.getDate() - parseInt(config.LogCleanerTaskEndRange));
        } else {
            cleaningRangeEnd = new Date();
            cleaningRangeEnd.setTime(cleaningEndTimeStamp);
        }

        //console.log('cleaning task: ' + JSON.stringify(task));
        //console.log('Cleaning cleaningRangeStart: ' + cleaningRangeStart + ' cleaningRangeEnd: ' + cleaningRangeEnd);


        var nextStart = new Date();
        nextStart.setTime(cleaningRangeStart.getTime());
        var nextEnd = new Date();
        //console.log('Cleaning nextStart: ' + nextStart + ' nextEnd: ' + nextEnd);


        while (nextStart < cleaningRangeEnd) {
            nextEnd.setTime(nextStart.getTime());
            nextEnd.setDate(nextEnd.getDate() + parseInt('1'));
            if (nextEnd.getTime() >= cleaningRangeEnd.getTime()) {
                nextEnd = cleaningRangeEnd;
            }
            //console.log('Cleaning logs start: ' + JSON.stringify(nextStart) + ' end: ' + JSON.stringify(nextEnd));
            this.logService.cleanLogs(nextStart.getTime(), nextEnd.getTime(), task.tenantId);
            nextStart.setDate(nextStart.getDate() + parseInt('1'));
        }

    }
}