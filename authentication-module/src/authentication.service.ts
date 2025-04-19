import { Injectable, HttpService, Inject } from '@nestjs/common';
import { NodeObject } from '../../object-schema/src/schemas/catalog.node';


@Injectable()
export class AuthenticationService {
  constructor(
    private readonly httpService: HttpService,
  ) { }

  async validatePassword(
    thePassword: string,
    theSalt: string,
    theInPassword: string,
  ): Promise<any> {
    return this.httpService
      .post(
        'http://' + 'authenticator' +
        ':' +
        '8260' +
        '/auth/validate-password',
        {
          password: thePassword,
          salt: theSalt,
          inpassword: theInPassword,
        },
      )
      .toPromise()
      .then(result => {
        if (result && result.data && result.data.status === 0) {
          return result.data;
        } else {
          return { status: 1003, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 1003, message: 'Internal Error' };
      });

  }

  async hashEncryptedPassword(thePassword: string, theSalt: string): Promise<any> {

    return this.httpService
      .post(
        'http://' +
        'authenticator' +
        ':' +
        '8260' +
        '/auth/hash-password',
        { password: thePassword, salt: theSalt },
      )
      .toPromise()
      .then(result => {
        if (result && result.data) {
          return result.data;
        } else {
          return { status: 1003, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 1003, message: 'Internal Error' };
      });

  }

  async hashPlainPassword(thePassword: string, theSalt: string): Promise<any> {

    return this.httpService
      .post(
        'http://' +
        'authenticator' +
        ':' +
        '8260' +
        '/auth/create-hash',
        { password: thePassword, salt: theSalt },
      )
      .toPromise()
      .then(result => {
        if (result && result.data) {
          return result.data;
        } else {
          return { status: 1003, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 1003, message: 'Internal Error' };
      });

  }

  async decryptPassword(theEncryptedPassword: string): Promise<any> {

    return this.httpService
      .post(
        'http://' +
        'authenticator' +
        ':' +
        '8260' +
        '/auth/decrypt-rsa',
        { password: theEncryptedPassword },
      )
      .toPromise()
      .then(result => {
        if (result && result.data) {
          return result.data;
        } else {
          return { status: 1003, message: 'Internal Error' };
        }
      })
      .catch(error => {
        return { status: 1003, message: 'Internal Error' };
      });

  }
}
