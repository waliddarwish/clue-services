import { Module, HttpModule } from '@nestjs/common';
import { MetadataImportingService } from './metadata-importing.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [MetadataImportingService],
})
export class MetadataImportingModule {}
