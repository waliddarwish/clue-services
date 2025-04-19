import { Module, HttpModule } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { AppModule } from '../../app-module/src/app.module';

@Module({
  imports: [HttpModule],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class LoggerModule extends AppModule {}
