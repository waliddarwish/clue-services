import { Injectable, Inject } from '@nestjs/common';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { User, Tenant } from '../../../database-module/src/database.schemas';
import { Model } from 'mongoose';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { TenantObject } from '../../../object-schema/src/schemas/catalog.tenant';
import { UserObject } from '../../../object-schema/src/schemas/catalog.user';
import passwordGenerator = require('generate-password');
import { AppMailService } from '../../../mail-module/src/mail.service';

@Injectable()
export class SecurityService {
  async findUserByID(theId: any): Promise<any> {
    return this.userProvider.findOne({ id: theId }).exec().then((result) => {
      if (result) {
        return result;
      } else {
        throw new Error('User record not found');
      }
    });
  }

  constructor(private readonly authService: AuthenticationService,
    @Inject('userProvider') private readonly userProvider: Model<User>,
    @Inject('tenantProvider') private readonly tenantProvider: Model<Tenant>,
    private readonly globalizationService: GlobalizationService,
    private readonly mailService: AppMailService) {
  }

  async changePassword(user: UserObject, oldPassword: string, newPassword: string): Promise<any> {
    if (!user) {
      return this.globalizationService.get('en', '8888').then((theMessage: any): any => {
        return { status: 8888, message: theMessage };
      });
    }
    return this.authService.validatePassword(oldPassword, user.id, user.password).then(
      (result: any) => {
        if (result && result.status === 0) {
          if (result.data.valid) {
            return this.authService.hashEncryptedPassword(newPassword, user.id).then((result1) => {
              if (result1.status === 0) {
                return this.userProvider.updateOne({ id: user.id }, { password: result1.data, passwordStatus: 'Valid' }).exec().then(() => {
                  user.password = result1.data;
                  return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                    return { status: 0, message: theMessage };
                  });
                }).catch((error) => {
                  return this.globalizationService.get('en', '8888').then((theMessage: any): any => {
                    return { status: 8888, message: theMessage };
                  });
                });
              } else {
                return this.globalizationService.get('en', '1008').then((theMessage: any): any => {
                  return { status: 1008, message: theMessage };
                });
              }
            });
          } else {
            return this.globalizationService.get('en', '1007').then((theMessage: any): any => {
              return { status: 1007, message: theMessage };
            });
          }
        } else {
          return this.globalizationService.get('en', '1006').then((theMessage: any): any => {
            return { status: 1006, message: theMessage };
          });
        }
      }
    ).catch((error) => {
      return this.globalizationService.get('en', '1006').then((theMessage: any): any => {
        return { status: 1006, message: theMessage, data: error };
      });
    });
  }

  async resetPassword(theUsername: string): Promise<any> {
    return this.userProvider.findOne({ username: theUsername }).exec().then((user) => {
      if (user) {
        const theNewPassword = passwordGenerator.generate();
        return this.authService.hashPlainPassword(theNewPassword, user.id).then((result) => {
          if (result.status === 0) {
            return this.userProvider.updateOne({ id: user.id }, { password: result.data, passwordStatus: 'Reset' }).exec().then(() => {
              this.mailService.sendMail('password-reset', user.username, {
                name: user.name.firstName + ' '
                  + user.name.lastName, newPassword: theNewPassword,
              });
              return this.globalizationService.get('en', 'Success').then((theMessage: any): any => {
                return { status: 0, message: theMessage };
              });
            }).catch((error) => {
              return this.globalizationService.get('en', '8888').then((theMessage: any): any => {
                return { status: 8888, message: theMessage };
              });
            });
          } else {
            return this.globalizationService.get('en', '1008').then((theMessage: any): any => {
              return { status: 1008, message: theMessage };
            });
          }
        });
      } else {
        return this.globalizationService.get('en', '1010').then((theMessage: any): any => {
          return { status: 1010, message: theMessage };
        });
      }
    });
  }

  async authenticate(auth: any): Promise<any> {
    return this.userProvider.findOneAndUpdate({ username: auth.username }, { lastLoginTime: new Date().getTime() }).exec().then((theUser) => {
      if (theUser) {
        return this.authService.validatePassword(auth.password, theUser.id, theUser.password).then((result: any) => {
          if (result.status === 0) {
            this.userProvider.updateOne({ id: theUser.id }, { lastLoginSuccessful: true }).exec();
            return this.tenantProvider.findOne({ id: theUser.tenantId }).exec().then((theTenant: TenantObject) => {
              return { user: theUser, tenant: theTenant, authResult: result.data };
            });
          } else {
            this.userProvider.updateOne({ id: theUser.id }, { lastLoginSuccessful: false }).exec();
            throw new Error('Error validating password');
          }
        });
      } else {
        return this.globalizationService.get('en', '1002').then((theMessage: any): any => {
          return { status: 1002, message: theMessage, data: null };
        });
      }
    }).catch((error) => {
      return this.globalizationService.get('en', '2001').then((theMessage: any): any => {
        return { status: 2001, message: theMessage, data: error };
      });
    });
  }

}
