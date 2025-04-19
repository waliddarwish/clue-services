import { Module, HttpModule } from '@nestjs/common';
import { LogService } from './log.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [LogService],
})
export class LogModule {
}
