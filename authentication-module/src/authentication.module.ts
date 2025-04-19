import { Module, HttpModule } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
