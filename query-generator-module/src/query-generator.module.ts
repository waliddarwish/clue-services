import { Module, HttpModule } from '@nestjs/common';
import { QueryGeneratorService } from './query-generator.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [QueryGeneratorService],
})
export class QueryGeneratorModule {}
