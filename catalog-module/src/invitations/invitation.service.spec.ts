import { Test } from '@nestjs/testing';
import { GlobalizationService } from '../../../globalization-module/src/globalization.service';
import { AppMailService } from '../../../mail-module/src/mail.service';
import { AuthenticationService } from '../../../authentication-module/src/authentication.service';
import { InvitationService } from './invitation.service';



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
    hashEncryptedPassword: jest.fn()
};
let inviteModel;
let userModel;

let invitationService;
describe("Test InvitationService ", () => {

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                { provide: GlobalizationService, useFactory: () => { return globalizationServiceMocked } },
                { provide: AppMailService, useFactory: () => { return mailServiceMocked } },
                { provide: AuthenticationService, useFactory: () => { return authServiceMocked } },
            ]
        }).compile();

        inviteModel = {
            find: jest.fn().mockImplementation(() => (inviteModel)),
            findOne: jest.fn().mockImplementation(() => (inviteModel)),
            updateOne: jest.fn().mockImplementation(() => (inviteModel)),
            deleteOne: jest.fn().mockImplementation(() => (inviteModel)),
            deleteMany: jest.fn().mockImplementation(() => (inviteModel)),
            where: jest.fn().mockImplementation(() => (inviteModel)),
            equals: jest.fn().mockImplementation(() => (inviteModel)),
            exec: jest.fn()
        };
        
        userModel = {};

        globalizationService = await module.get<GlobalizationService>(GlobalizationService);
        mailService = await module.get<AppMailService>(AppMailService);
        authService = await module.get<AuthenticationService>(AuthenticationService);

        invitationService = new InvitationService(globalizationService, inviteModel, userModel, mailService, authService);
    });



    it('test deleteInvite scenario 1', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve({deletedCount: 10}));
        let result = await invitationService.deleteInvite('inviteId');
        expect(result).toEqual({deletedCount: 10});
    });

    it('test deleteInvite scenario 2', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve({deletedCount: 0}));
        expect(invitationService.deleteInvite('inviteId')).rejects.toEqual(new Error('Invitation not found'));

    });

    it('test deleteInvite scenario 3', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.reject('error12'));
        expect(invitationService.deleteInvite('inviteId')).rejects.toEqual('error12');

    });

    it('test deleteAllAcceptedInvitation', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve({name: 'spider man'}));
        let result = await invitationService.deleteAllAcceptedInvitation('tenantId');
        expect(result).toEqual({name: 'spider man'});
    });

    it('test getTenantInvites', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve({name: 'spider man'}));
        let result = await invitationService.getTenantInvites('tenantId');
        expect(result).toEqual({name: 'spider man'});
    });

    it('test getInviteInfo', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve({name: 'spider man'}));
        let result = await invitationService.getInviteInfo('tenantId');
        expect(result).toEqual({name: 'spider man'});
    });

    it('test resendInvite scenario 1', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve([{name: 'spider man'}]));
        let result = await invitationService.resendInvite('tenantId');
        expect(result).toEqual([{name: 'spider man'}]);
    });

    it('test resendInvite scenario 2', async() => {
        inviteModel.exec.mockReturnValueOnce(Promise.resolve([]));
        expect(invitationService.resendInvite('tenantId')).rejects.toEqual(new Error('Invitation does not exist'));
    });

    it('test sendEmail', async() => {
        globalizationService.get.mockReturnValueOnce(Promise.resolve('theMessage'));
        let result = await invitationService.sendEmail('template', 'email', 'context');
        expect(result).toEqual({ status: 0, message: 'theMessage' });
        expect(mailServiceMocked.sendMail).toBeCalled();
        expect(mailServiceMocked.sendMail).toBeCalledWith('template', 'email', 'context');
    });


    describe('Test acceptInvite', () => {

        let invite = {
            tenantId: 'tenantId',
            email: 'email',
            role: 'role',
        };
        let createdUserInfo = {
            password: 'pass',
            firstName: 'firstName',
            lastName: 'lastName',
            userLanguage: 'userLanguage',
            userTimeZone: 'userTimeZone',
            username: 'fattah',
            name: {
                firstName: 'firstName',
                lastName: 'lastName',
            }
        };
        beforeEach(async () => {
            userModel= jest.fn().mockImplementation(() => {
                return {
                    createdUser: jest.fn().mockImplementation(() => { return createdUserInfo }),
                    save: jest.fn().mockReturnValue(Promise.resolve(createdUserInfo)),
                }
            });
            invitationService = new InvitationService(globalizationService, inviteModel, userModel, mailService, authService);
        });

        it('test acceptInvite scenario 1', async ()=> {
            inviteModel.exec.mockReturnValueOnce(Promise.resolve(invite));
            authServiceMocked.hashEncryptedPassword.mockReturnValueOnce(Promise.resolve({status: 0, data: 'data'}));
            let result = await invitationService.acceptInvite(createdUserInfo);
            expect(result).toEqual({"user": {"firstName": "firstName", "lastName": "lastName", "name": {"firstName": "firstName", "lastName": "lastName"}, "password": null, "userLanguage": "userLanguage", "userTimeZone": "userTimeZone", "username": "fattah"}});
            expect(authServiceMocked.hashEncryptedPassword).toBeCalledWith("pass", expect.anything());
            expect(authServiceMocked.hashEncryptedPassword).toBeCalledTimes(1);
            expect(mailServiceMocked.sendMail).toBeCalledTimes(1);
            expect(mailServiceMocked.sendMail).toBeCalledWith("welcome", "fattah", {"name": "firstName lastName"});
        });

        it('test acceptInvite scenario 2', async ()=> {
            inviteModel.exec.mockReturnValueOnce(Promise.resolve(invite));
            authServiceMocked.hashEncryptedPassword.mockReturnValueOnce(Promise.resolve({status: 10, data: 'data'}));
            expect(invitationService.acceptInvite(createdUserInfo)).rejects.toEqual(new Error('Unable to register user'));;

        });

    });


    describe('Test sendInvite', () => {
        let newInvite = {
            email: 'toha70@email.email',
            role: 'admin',
            tenantId: 'tenantId',
            firstName: 'abdelmalek',
            lastName: 'abdallah',
        }
        beforeEach(async () => {
            inviteModel= jest.fn().mockImplementation(() => {
                return {
                    invitationObject: jest.fn().mockImplementation(() => { return newInvite }),
                    save: jest.fn().mockReturnValue(Promise.resolve(newInvite)),
                }
            });
            invitationService = new InvitationService(globalizationService, inviteModel, userModel, mailService, authService);
        });

        it('test sendInvite scenario 1', async() => {
            let result = await invitationService.sendInvite(newInvite.email, newInvite.role, newInvite.tenantId, newInvite.firstName, newInvite.lastName);
            expect(result).toEqual({"email": "toha70@email.email", "firstName": "abdelmalek", "lastName": "abdallah", "role": "admin", "tenantId": "tenantId"});
        });
    });
});