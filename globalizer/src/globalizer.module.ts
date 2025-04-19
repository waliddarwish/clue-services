import { Module, HttpModule } from '@nestjs/common';
import { GlobalizerController } from './globalizer.controller';
import { GlobalizerService } from './globalizer.service';
import { AppModule } from '../../app-module/src/app.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';

@Module({
  imports: [HttpModule],
  controllers: [GlobalizerController],
  providers: [GlobalizerService, LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },],
})
export class GlobalizerModule extends AppModule {}