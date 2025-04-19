import { Injectable } from '@nestjs/common';
import { AuthenticationService } from '../../authentication-module/src/authentication.service';
import { BaseConnectionTester } from './connection.base-tester';
import connectionTesterFactory = require('./connection.tester-factory');

@Injectable()
export class ConnectionTesterService {

  constructor( private readonly authenticationService: AuthenticationService) {
  }
  async testConnection(connection: any): Promise<any> {
    const tester: BaseConnectionTester = connectionTesterFactory.default(connection , this.authenticationService);
    if (tester) {
      return tester.testConnection().catch((error) => {
        console.log('ConnectionTesterService: error: ' +  JSON.stringify(error));
        return {result: 'Internal Error' , error};
      });
    } else {
      return { result : 'Unknown Connection type' + connection.connectionType};
    }
  }

}
