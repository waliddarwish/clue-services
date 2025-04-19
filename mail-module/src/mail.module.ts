import { Module, HttpModule } from '@nestjs/common';
import { AppMailService } from './mail.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AppMailService],
})
export class AppMailModule {}
