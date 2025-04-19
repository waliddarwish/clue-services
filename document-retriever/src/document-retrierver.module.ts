import { Module, HttpModule } from '@nestjs/common';
import { DocumentRetrieverController } from './document-retriever.controller';
import { DocumentRetrieverService } from './document-retriever.service';
import { AppModule } from '../../app-module/src/app.module';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';

@Module({
  imports: [HttpModule],
  controllers: [DocumentRetrieverController],
  providers: [DocumentRetrieverService, LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },],
})
export class DocumentRetrieverModule extends AppModule {}