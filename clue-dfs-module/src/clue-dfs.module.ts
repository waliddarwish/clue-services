import { Module, HttpModule } from '@nestjs/common';
import { ClueDFSService } from './clue-dfs.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [ClueDFSService],
})
export class ClueDFSModule { }
