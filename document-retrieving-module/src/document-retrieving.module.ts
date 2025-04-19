import { Module, HttpModule } from '@nestjs/common';
import { DocumentService } from './document.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [DocumentService],
})
export class DocumentModule {}
