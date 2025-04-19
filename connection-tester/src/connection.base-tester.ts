import { AuthenticationService } from '../../authentication-module/src/authentication.service';
export class BaseConnectionTester {
    protected connection: any;
    protected authenticationService: AuthenticationService;
    constructor(connection, theAuthService: AuthenticationService) {
        this.connection = connection;
        this.authenticationService = theAuthService;
    }

    protected async decryptPassword(): Promise<any> {
        return this.authenticationService.decryptPassword(this.connection.connectionInfo.password).then((result) => {
            if (result.status === 0) {
                this.connection.connectionInfo.password = result.data;
                return this.connection;
            } else {
                throw new Error('Unable to resolve provided password');
            }
        });
    }


    public async testConnection(): Promise<any> {
        return this.decryptPassword().then(() => {
            return this.testConnectionInternal();
        });
    }

    protected async testConnectionInternal(): Promise<any> {
        // base function does nothing 
    }
 }