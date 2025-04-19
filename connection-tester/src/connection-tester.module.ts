import { Module, HttpModule } from '@nestjs/common';
import { ConnectionTesterController } from './connection-tester.controller';
import { ConnectionTesterService } from './connection-tester.service';
import { AppModule } from '../../app-module/src/app.module';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { AuthenticationModule } from '../../authentication-module/src/authentication.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';


@Module({
  imports: [HttpModule, AuthenticationModule],
  controllers: [ConnectionTesterController],
  providers: [ConnectionTesterService, AuthenticationService, LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }],
})
export class ConnectionTesterModule extends AppModule {}
