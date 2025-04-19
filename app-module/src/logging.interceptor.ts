import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map, retryWhen } from 'rxjs/operators';
import { LogService } from '../../log-module/src/log.service';



@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logService: LogService) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const requestTimeStamp = Date.now();

        return next.handle().pipe(map(data => {
            const duration = Date.now() - requestTimeStamp;
            const ctx = context.switchToHttp();
            const request = ctx.getRequest().body;
            const callRoute = context.getClass().name + '.' + context.getHandler().name;
            if (callRoute === 'HACommonController.ping') {
                return data;
            }
            const dataStr = JSON.stringify(data);
            const logMessage = 'Request [' + JSON.stringify(request) + '] Response: [' + JSON.stringify(data) + ']';
            this.logService.log('logger', 'debug', logMessage, 'call', null, null, null, null, duration, callRoute);

            return data;
        }));
    }
}
