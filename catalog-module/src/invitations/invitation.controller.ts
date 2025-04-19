import {
  Controller,
  Put,
  Body,
  Post,
  Get,
  Delete,
  Param,
  Session,
  UseInterceptors,
} from '@nestjs/common';

import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { InvitationService } from './invitation.service';
import { ApiProperty, ApiOperation, ApiParam, ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';

class CreateUserDTO {
  @ApiProperty()
  invitationId: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string; 
  @ApiProperty()
  userLanguage: string;
  @ApiProperty()
  userTimeZone: string;
}

class SendInvitationDTO {
  @ApiProperty()
  email: string;
  @ApiProperty()
  role: string;   
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}

class EmailContextParameter {

}
class SendEmailDTO {
  @ApiProperty()
  theTemplate: string; 
  @ApiProperty()
  targetEmail: string; 
  @ApiProperty()
  theContext: any;
}
@Controller('invitation')
@ApiTags('Invitations')
export class InvitationController {
  constructor(
    private readonly globalizationService: GlobalizationService,
    private readonly invitationService: InvitationService,
  ) { }

  @Put('accept')
  @ApiOperation({ summary: 'Accept user invitation and creates the user record'})
  @ApiBody({ type : CreateUserDTO })
  async acceptInvitation(@Body() body: CreateUserDTO): Promise<any> {
    return this.invitationService
      .acceptInvite(body)
      .then(
        (result: any): Promise<any> => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage: any): any => {
              return { status: 0, message: theMessage, data: result };
            },
          );
        },
      )
      .catch(error => {
        // tslint:disable-next-line: no-console
        return this.globalizationService.get('en', '2003').then(
          (theMessage: any): any => {
            return { status: 2003, message: theMessage, data: error };
          },
        );
      });
  }

  @Put('invite')
  @ApiOperation({ summary: 'Sends invitation email and creates an invitation tracking record'})
  @ApiBody({ type : SendInvitationDTO })
  @ApiHeader( { name : "passport" } )
  async sendInvitation(@Body() body: SendInvitationDTO, @Session() session): Promise<any> {
    return this.invitationService.sendInvite(body.email, body.role, session.user.tenantId, body.firstName, body.lastName)
      .then(result => {
        return this.globalizationService.get('en', 'Success').then(
          (theMessage: any): any => {
            return { status: 0, message: theMessage, data: result };
          },
        );
      })
      .catch(error => {
        return this.globalizationService.get('en', '2002').then(
          (theMessage: any): any => {
            return { status: 2002, message: theMessage, data: error };
          },
        );
      });
  }


  @Delete('delete/:invitationId')
  @ApiOperation({ summary: "Deletes an invitation tracking record"})
  @ApiParam({ name: 'invitationId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async deleteInvite(@Param() params): Promise<any> {
    return this.invitationService
      .deleteInvite(params.invitationId)
      .then(
        (result: any): Promise<any> => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage: any): any => {
              return { status: 0, message: theMessage };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '2001').then(
          (theMessage: any): any => {
            return {
              status: 2001,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }


  @Delete('delete-all-accepted')
  @ApiOperation({ summary: "Deletes all accepted invitation tracking records"})
  @ApiHeader( { name : "passport" } )
  async deleteAllAcceptedInvitation(@Session() session): Promise<any> {
    return this.invitationService
      .deleteAllAcceptedInvitation(session.user.tenantId)
      .then(
        (result: any): Promise<any> => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage: any): any => {
              return { status: 0, message: theMessage };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '2001').then(
          (theMessage: any): any => {
            return {
              status: 2001,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get('get-invites')
  @ApiOperation({ summary: "Returns all invitation tracking records for a tenant"})
  @ApiHeader( { name : "passport" } )
  async getTenantInvitations(@Session() session): Promise<any> {
    return this.invitationService
      .getTenantInvites(session.user.tenantId)
      .then(
        (result) => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage) => {
              return { status: 0, message: theMessage, data: result };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '2004').then(
          (theMessage: any): any => {
            return {
              status: 2004,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }

  @Get('get-inviteinfo/:invitationId')
  @ApiOperation({ summary: "Returns an invitation tracking record by id"})
  @ApiParam({ name: 'invitationId', required: true, type: 'string' })
  async getInvitationInfo(@Param() params): Promise<any> {
    return this.invitationService
      .getInviteInfo(params.invitationId)
      .then(
        (result) => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage) => {
              return { status: 0, message: theMessage, data: result };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '2004').then(
          (theMessage: any): any => {
            return {
              status: 2004,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }


  @Post('resend/:invitationId')
  @ApiOperation({ summary: "Resend an invitation email"})
  @ApiParam({ name: 'invitationId', required: true, type: 'string' })
  @ApiHeader( { name : "passport" } )
  async resendInvitation(@Param() param: any): Promise<any> {
    return this.invitationService
      .resendInvite(param.invitationId)
      .then(
        (result: any): Promise<any> => {
          return this.globalizationService.get('en', 'Success').then(
            (theMessage: any): any => {
              return { status: 0, message: theMessage };
            },
          );
        },
      )
      .catch(error => {
        return this.globalizationService.get('en', '2005').then(
          (theMessage: any): any => {
            return {
              status: 2005,
              message: theMessage,
              data: error,
            };
          },
        );
      });
  }



  @Post('send-email')
  @ApiOperation({ summary: "Reyurns an invitation tracking record by id"})
  @ApiHeader( { name : "passport" } )
  async sendEmail(@Body() body: SendEmailDTO): Promise<any> {
    return this.invitationService.sendEmail(body.theTemplate, body.targetEmail, body.theContext);
  }
}
