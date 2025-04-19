import { Module, HttpModule } from '@nestjs/common';
import { DatasetCDBService } from './dataset.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [DatasetCDBService],
})
export class DatasetCDBModule { }
