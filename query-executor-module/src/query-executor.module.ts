import { Module, HttpModule } from '@nestjs/common';
import { QueryExecutorService } from './query-executor.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [QueryExecutorService],
})
export class QueryExecutorModule {}
