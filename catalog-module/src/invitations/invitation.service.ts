import { Injectable, Inject } from '@nestjs/common';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { Invitation, User } from '../../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { UserObject } from '../../../object-schema/src/schemas/catalog.user';
import { InvitationObject } from '../../../object-schema/src/schemas/catalog.invitation';
import uuidv4 = require('uuid/v4');
import { AppMailService } from '../../../mail-module/src/mail.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { UserInfo } from 'os';

@Injectable()
export class InvitationService {
  constructor(
    private readonly globalizationService: GlobalizationService,
    @Inject('invitationProvider') private readonly inviteModel: Model<Invitation>,
    @Inject('userProvider') private readonly userModel: Model<User>,
    private readonly mailService: AppMailService,
    private readonly authService: AuthenticationService,
  ) { }

  async acceptInvite(createUseInfo: any): Promise<any> {
    return this.inviteModel.findOne({ id: createUseInfo.invitationId }).exec().then(invite => {
          const userObject = {
            id: uuidv4(),
            tenantId: invite.tenantId,
            username: invite.email,
            role: invite.role,
            password: createUseInfo.password,
            name: { firstName: createUseInfo.firstName, lastName: createUseInfo.lastName },
            userLanguage: createUseInfo.userLanguage,
            userTimeZone: createUseInfo.userTimeZone,
          };
          return this.authService.hashEncryptedPassword(createUseInfo.password, userObject.id).then((result) => {
            if (result.status === 0) {
              userObject.password = result.data;
              const createdUser = new this.userModel(userObject);
              return createdUser.save().then((user: UserObject) => {
                this.mailService.sendMail('welcome', user.username, { name: user.name.firstName + ' ' + user.name.lastName }); // send mail async
                user.password = null;
                this.inviteModel.updateOne({ id: invite.id }, { status: 'Accepted' }).exec();
                //TODO : update subscription plan

                return { user };
              });
            } else {
              throw new Error('Unable to register user');
            }

          });

    });
  }

  async sendInvite(
    email: string,
    role: string,
    tenantId: string,
    firstName: string,
    lastName: string,
  ): Promise<any> {
    const invitationObject = new this.inviteModel();
    invitationObject.id = uuidv4();
    invitationObject.email = email;
    invitationObject.tenantId = tenantId;
    invitationObject.role = role;
    invitationObject.firstName = firstName;
    invitationObject.lastName = lastName;
    invitationObject.invitationDate = new Date().getTime();
    return invitationObject
      .save()
      .then((invite: InvitationObject) => {
        this.mailService.sendMail('user-invite', invite.email, {
          inviteId: invite.id,
          email: invite.email,
          firstName: invite.firstName,
          lastName: invite.lastName,
        }); // send mail async
        return invite;
      })
      .catch(error => {
        throw error;
      });
  }

  async deleteInvite(inviteId: string): Promise<any> {
    return this.inviteModel
      .deleteOne({ id: inviteId })
      .exec()
      .then(result => {
        if (result && result.deletedCount === 0) { throw new Error('Invitation not found'); }
        return result;
      })
      .catch(error => {
        throw error;
      });
  }
  async deleteAllAcceptedInvitation(tenantId: string): Promise<any> {
    return this.inviteModel
      .deleteMany({ tenantId, status: 'Accepted' })
      .exec();
  }
  async getTenantInvites(tenantId: string): Promise<any> {
    return this.inviteModel
      .find()
      .where('tenantId')
      .equals(tenantId)
      .exec();
  }
  async getInviteInfo(id: string): Promise<any> {
    return this.inviteModel
      .findOne({ id })
      .exec();
  }
  async resendInvite(theId: string): Promise<any> {
    return this.inviteModel
      .find()
      .where('id')
      .equals(theId)
      .exec()
      .then(invite => {
        if (invite.length === 0) {
          throw new Error('Invitation does not exist');
        }
        this.mailService.sendMail('user-invite', invite[0].email, {
          inviteId: invite[0].id,
          email: invite[0].email,
        }); // send mail async
        return invite;
      });
  }

  async sendEmail(theTemplate: string, targetEmail: string, theContext: any) {
    this.mailService.sendMail(theTemplate, targetEmail, theContext);
    return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
      return { status: 0, message: theMessage };
    });
  }
}
