import { Module, HttpModule } from '@nestjs/common';
import { MetadataCoordinationService } from './metadata-coordination.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [MetadataCoordinationService],
})
export class MetadataCoordinationModule {}
