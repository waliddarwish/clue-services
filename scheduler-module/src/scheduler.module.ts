import { Module, HttpModule } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [SchedulerService],
})
export class SchedulerModule {}
