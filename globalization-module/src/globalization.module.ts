import { Module, HttpModule, HttpService } from '@nestjs/common';
import { GlobalizationService } from './globalization.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [GlobalizationService],
})
export class GlobalizationModule {}
