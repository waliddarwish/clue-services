import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { AuthenticatorController } from './auth.controller';
import { AuthenticatorService } from './auth.service';
import { ObjectSchemaModule } from '../../object-schema/src/object-schema.module';
import { CryptoModule } from '@akanass/nestjsx-crypto';
import { AppModule } from '../../app-module/src/app.module';
import { GlobalizationService } from '../../globalization-module/src/globalization.service';
import { LogService } from '../../log-module/src/log.service';
import { APP_INTERCEPTOR } from '../../app-module/node_modules/@nestjs/core';
import { LoggingInterceptor } from '../../app-module/src/logging.interceptor';

@Module({
  imports: [
    forwardRef(() => HttpModule),
    ObjectSchemaModule,
    CryptoModule,
  ],
  controllers: [AuthenticatorController],
  providers: [AuthenticatorService, GlobalizationService, LogService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },],
})
export class AuthenticatorModule extends AppModule {}
