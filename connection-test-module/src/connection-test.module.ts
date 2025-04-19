import { Module, HttpModule } from '@nestjs/common';
import { ConnectionTestService } from './connection-test.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [ConnectionTestService],
})
export class ConnectionTestModule {}
