import { Test } from '@nestjs/testing';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { AppMailService } from '../../../mail-module/src/mail.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { SecurityService } from '../security/security.service';
import passwordGenerator = require('generate-password');


let userProvider;
let tenantProvider;

describe('Test security service', () => {
    let globalizationService;
    let globalizationServiceMocked = {
        get: jest.fn()
    };
    let mailService;
    let mailServiceMocked = {
        sendMail: jest.fn()
    };
    let authService;
    let authServiceMocked = {
        validatePassword: jest.fn(),
        hashEncryptedPassword: jest.fn(),
        hashPlainPassword: jest.fn()
    };
    let securityService;


    beforeEach(async () => {

        const module = await Test.createTestingModule({
            providers: [
                { provide: GlobalizationService, useFactory: () => { return globalizationServiceMocked } },
                { provide: AppMailService, useFactory: () => { return mailServiceMocked } },
                { provide: AuthenticationService, useFactory: () => { return authServiceMocked } },
            ]
        }).compile();

        globalizationService = await module.get<GlobalizationService>(GlobalizationService);
        mailService = await module.get<AppMailService>(AppMailService);
        authService = await module.get<AuthenticationService>(AuthenticationService);

        userProvider = {
            find: jest.fn().mockImplementation(() => (userProvider)),
            findOne: jest.fn().mockImplementation(() => (userProvider)),
            exec: jest.fn(),
            updateOne: jest.fn().mockImplementation(() => (userProvider)),
            findOneAndUpdate: jest.fn().mockImplementation(() => (userProvider)),
        };
        tenantProvider = {
            find: jest.fn().mockImplementation(() => (tenantProvider)),
            findOne: jest.fn().mockImplementation(() => (tenantProvider)),
            exec: jest.fn()
        };

        securityService = new SecurityService(authService, userProvider, tenantProvider, globalizationService, mailService);

        
        jest.genMockFromModule('generate-password');
        jest.mock('generate-password');
    });

    it('Test findUserByID successful', async () => {
        userProvider.exec.mockReturnValueOnce(Promise.resolve({}));
        let result = await securityService.findUserByID('');
        expect(result).toEqual({});
    });

    it('Test findUserByID failed', async () => {
        userProvider.exec.mockReturnValueOnce(Promise.resolve(null));
        //expect(() => { securityService.findUserByID('')}).toThrow(new Error("User record not found"));

        //expect(securityService.findUserByID('')).toThrow;
    });

    it('Test changePassword with null user', async () => {
        let errorResult = 'theMessage';
        globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

        let result = await securityService.changePassword(null, '', '');
        expect(result).toEqual({ status: 8888, message: errorResult });
    });

    describe('Test validate Password', () => {
        it('Test changePassword with rejected promise authService.validatePassword', async () => {
            let user = {
                id: '123'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.reject('errorResult'));


            let errorResult = 'Error';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(errorResult));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 1006, message: errorResult, data: 'errorResult' });
        });

        it('Test changePassword with non-zero authService.validatePassword', async () => {
            let user = {
                id: '123'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            let validatePassResult = { status: 10 };
            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePassResult));


            let theMessage = 'Error';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 1006, message: theMessage });
        });

        it('Test changePassword with invalid authService.validatePassword', async () => {
            let user = {
                id: '123'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            let validatePassResult = { status: 0, data: { valid: false } };
            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePassResult));


            let theMessage = 'Error';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 1007, message: theMessage });
        });

        it('Test changePassword with failed authService.hashEncryptedPassword', async () => {
            let user = {
                id: '123'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            let validatePassResult = { status: 0, data: { valid: true } };
            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePassResult));

            let hashEncryptedPasswordResult = 'Error';
            authServiceMocked.hashEncryptedPassword.mockResolvedValue(Promise.reject(hashEncryptedPasswordResult));

            let theMessage = 'Error';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 1006, message: theMessage, data: 'Error' });
        });

        it('Test changePassword with non-zero authService.hashEncryptedPassword', async () => {
            let user = {
                id: '123'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            let validatePassResult = { status: 0, data: { valid: true } };
            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePassResult));

            let hashEncryptedPasswordResult = { status: 10, data: { name: 'hello' } };
            authServiceMocked.hashEncryptedPassword.mockResolvedValue(Promise.resolve(hashEncryptedPasswordResult));

            let theMessage = 'Error';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 1008, message: theMessage });
        });

        it('Test changePassword with failed userProvider.updateOne', async () => {
            let user = {
                id: '123'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            let validatePassResult = { status: 0, data: { valid: true } };
            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePassResult));

            let hashEncryptedPasswordResult = { status: 0, data: { name: 'hello' } };
            authServiceMocked.hashEncryptedPassword.mockResolvedValue(Promise.resolve(hashEncryptedPasswordResult));

            let updateOneResult = 'error';
            userProvider.exec.mockReturnValueOnce(Promise.reject(updateOneResult));

            let theMessage = 'Error';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 8888, message: theMessage });
        });

        it('Test changePassword ', async () => {
            let user = {
                id: '123',
                password: 'pass'
            };
            let oldPassword = 'oldPassword';
            let newPassword = 'newPassword';

            let validatePassResult = { status: 0, data: { valid: true } };
            authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePassResult));

            let hashEncryptedPasswordResult = { status: 0, data: { name: 'hello' } };
            authServiceMocked.hashEncryptedPassword.mockResolvedValue(Promise.resolve(hashEncryptedPasswordResult));

            let updateOneResult = {};
            userProvider.exec.mockReturnValueOnce(Promise.resolve(updateOneResult));

            let theMessage = 'Success';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

            let result = await securityService.changePassword(user, oldPassword, newPassword);
            expect(result).toEqual({ status: 0, message: theMessage });

        });
    });


    describe('Test resetPassword' , () => {
        it('test reset password non-zero hashPlainPassword', async () => {
            let user = {};
            userProvider.exec.mockReturnValueOnce(Promise.resolve(user));

            let theNewPassword = 'newPassword';
            passwordGenerator.generate = jest.fn().mockReturnValueOnce(theNewPassword);

            let hashPlainPasswordResult = { status: 10, data: { name: 'hello' } };
            authServiceMocked.hashPlainPassword.mockResolvedValue(Promise.resolve(hashPlainPasswordResult));

            let theMessage = 'failed';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));
            
            let result = await securityService.resetPassword('user name');
            expect(result).toEqual({ status: 1008, message: theMessage });
        });

        it('test reset password failed userProvider updateOne', async () => {
            let user = {};
            userProvider.exec.mockReturnValueOnce(Promise.resolve(user));

            let theNewPassword = 'newPassword';
            passwordGenerator.generate = jest.fn().mockReturnValueOnce(theNewPassword);

            let hashPlainPasswordResult = { status: 0, data: { name: 'hello' } };
            authServiceMocked.hashPlainPassword.mockResolvedValue(Promise.resolve(hashPlainPasswordResult));

            let updateOneResult = 'error';
            userProvider.exec.mockReturnValueOnce(Promise.reject(updateOneResult));

            let theMessage = 'failed';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));
            
            let result = await securityService.resetPassword('user name');
            expect(result).toEqual({ status: 8888, message: theMessage });
        });

        it('test reset password', async () => {
            let user = {
                username: 'username',
                name: {
                    firstName: 'firstName',
                    lastName: 'lastName'
                }
            };
            userProvider.exec.mockReturnValueOnce(Promise.resolve(user));

            let theNewPassword = 'newPassword';
            passwordGenerator.generate = jest.fn().mockReturnValueOnce(theNewPassword);

            let hashPlainPasswordResult = { status: 0, data: { name: 'hello' } };
            authServiceMocked.hashPlainPassword.mockResolvedValue(Promise.resolve(hashPlainPasswordResult));

            let updateOneResult = 'success';
            userProvider.exec.mockReturnValueOnce(Promise.resolve(updateOneResult));

            mailServiceMocked.sendMail.mockImplementationOnce(()=>{return 'done';})

            let theMessage = 'Success';
            globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));
            
            let result = await securityService.resetPassword('user name');
            expect(result).toEqual({ status: 0, message: theMessage });
        });


        describe('Test authenticate' , () => {

            it('test authenticate with failed userProvider updateOne', async () => {

                let updateOneResult = 'error';
                userProvider.exec.mockReturnValueOnce(Promise.reject(updateOneResult));

                let theMessage = 'theError';
                globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

                let result = await securityService.authenticate({});
                expect(result).toEqual({ status: 2001, message: theMessage, data: 'error' });

            });

            it('test authenticate with null from findOneAndUpdate', async () => {

                let updateOneResult = null;
                userProvider.exec.mockReturnValueOnce(Promise.resolve(updateOneResult));

                let theMessage = 'theError';
                globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

                let result = await securityService.authenticate({});
                expect(result).toEqual({ status: 1002, message: theMessage, data: null });

            });

            it('test authenticate with non-zero validatePassword', async () => {

                let theUser = {};
                userProvider.exec.mockReturnValueOnce(Promise.resolve(theUser));

                let validatePasswordResult = {
                    status: 10
                };
                authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePasswordResult));


                let theMessage = 'theError';
                globalizationService.get.mockReturnValueOnce(Promise.resolve(theMessage));

                let result = await securityService.authenticate({});
                expect(result).toEqual({ status: 2001, message: theMessage, data:  Error('Error validating password') });

            });


            it('test authenticate', async () => {

                let theUser = {};
                userProvider.exec.mockReturnValueOnce(Promise.resolve(theUser));

                let validatePasswordResult = {
                    status: 0,
                    data: {id: 'absolute zero'},
                    tenantId: '123'
                };
                authServiceMocked.validatePassword.mockReturnValueOnce(Promise.resolve(validatePasswordResult));

                userProvider.exec.mockReturnValueOnce(Promise.resolve({}));

                let theTenant = {id: 'hello at 1 am'};
                tenantProvider.exec.mockReturnValueOnce(Promise.resolve(theTenant));

                let result = await securityService.authenticate({});
                expect(result).toEqual({ user: theUser, tenant: theTenant, authResult: validatePasswordResult.data });

            });

        });

    });

});
