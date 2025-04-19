import { Controller, Req, Res, Put, Body, Session, Post, Get, Param } from '@nestjs/common';

import { SecurityService } from './security.service';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { ApiOperation, ApiProperty, ApiParam, ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';


class ResetPasswordDto { 
  @ApiProperty()
  username: string 
}

class ChangePasswordDto { 
  @ApiProperty()
  oldPassword: string;
  @ApiProperty()
  newPassword: string
}

class AuthenticationDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}

@Controller('access')
@ApiTags('Access')
export class SecurityController {

  constructor(private readonly securityService: SecurityService,
              private readonly globalizationService: GlobalizationService) { }

  @Post('authenticate')
  @ApiOperation({summary: 'authenticate'})
  @ApiBody({ type: AuthenticationDTO })
  async authenticate(@Body() body: AuthenticationDTO, @Session() session): Promise<any> {
    return this.securityService.authenticate(body).then((result) => {
      if (result && result.authResult && result.authResult.valid) {
        session.user = JSON.parse(JSON.stringify(result.user)); // clone rather than pass by ref
        session.token = result.authResult.token;
        session.tokenTimestamp = result.authResult.created;
        result.user.password = null;
        return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
          return { status: 0, message: theMessage, data: result };
        });
      }  else {
        return this.globalizationService.get('en', '2001').then((theMessage: any): any => {
          return { status: 2001 , message: theMessage, data: null };
        });
      }
    });

  }

  @Post('logout')
  @ApiOperation({summary: 'logout'})
  @ApiHeader( { name : "passport" } )
  async logout(@Session() session): Promise<any> {
        session.user = null;
        session.token = null;
        session.tokenTimestamp = null;
        return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
          return { status: 0, message: theMessage };
        });
  }

 

  @Put('reset-password')
  @ApiOperation({summary : 'reset-password'})
  async resetPassword(@Body() body: ResetPasswordDto ): Promise<any> {
    return this.securityService.resetPassword(body.username);
  }


  @Put('change-password')
  @ApiOperation({summary: 'change-password'})
  @ApiBody({ type: ChangePasswordDto })
  @ApiHeader( { name : "passport" } )
  async changePassword(@Body() body: ChangePasswordDto , @Session() session): Promise<any> {
    return this.securityService.changePassword(session.user, body.oldPassword , body.newPassword);
  }

  @Get('user/:id')
  @ApiOperation({summary: 'get user'})
  @ApiParam({ name: 'id', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async getUserById(@Param() params): Promise<any> {
    return this.securityService.findUserByID(params.id).then((result: any): Promise<any> => {
      return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
        return { status: 0, message: theMessage, data: result };
      });
    }).catch((error) => {
      return this.globalizationService.get('en', '1012').then((theMessage: any): any => {
        return { status: 1011, message: theMessage, data: error };
      });
    });
  }

}

