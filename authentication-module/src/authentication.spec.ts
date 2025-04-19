import { Test } from '@nestjs/testing';
import { HttpService, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

const mockObservable = {
    toPromise: jest.fn()
}

let mockHttpService = {
    post: jest.fn()
};

describe("Test authentication module", () => {
    let httpService;
    let authenticationService;
    let encryptedPassword = 'encrypted';
    let theSalt = 'salt';
    let inputPassword = 'inPassword'

    beforeEach( async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                { provide: HttpService, useFactory: () => { return mockHttpService } } ,
            ]
       }).compile();
       httpService = await module.get<HttpService>(HttpService);
       authenticationService = await module.get<AuthenticationService>(AuthenticationService);
    });

    describe("Test validatePassword", () => {
        it("will be successful ", () => {
            let result = {"data" : {
                status: 0
            }};
           
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(authenticationService.validatePassword(encryptedPassword, theSalt, inputPassword)).resolves.toEqual(result.data);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/validate-password', {password: encryptedPassword, salt: theSalt, inpassword: inputPassword});
        });

        it("will be fail to validate the password ", () => {
            let result = { status: 1003, message: 'Internal Error' };
           
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue("failed");
            expect(authenticationService.validatePassword(encryptedPassword, theSalt, inputPassword)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/validate-password', {password: encryptedPassword, salt: theSalt, inpassword: inputPassword});
        });

        it("toPromise will throw an exception ", () => {
            let result = { status: 1003, message: 'Internal Error' };
           
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(authenticationService.validatePassword(encryptedPassword, theSalt, inputPassword)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/validate-password', {password: encryptedPassword, salt: theSalt, inpassword: inputPassword});
        });

    });


    describe('Test hashEncryptedPassword', () => {
        it("will be successful ", () => {
            let result = {"data" : {
                status: 0
            }};
           
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(authenticationService.hashEncryptedPassword(inputPassword, theSalt)).resolves.toEqual(result.data);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/hash-password', {password: inputPassword, salt: theSalt});
        });

        it("will be fail to hash the password ", () => {
            let result = { status: 1003, message: 'Internal Error' };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue("failed");
            expect(authenticationService.hashEncryptedPassword(inputPassword, theSalt)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/hash-password', {password: inputPassword, salt: theSalt});
        });

        it("toPromise will throw an exception ", () => {
            let result = { status: 1003, message: 'Internal Error' };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(authenticationService.hashEncryptedPassword(inputPassword, theSalt)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/hash-password', {password: inputPassword, salt: theSalt});
        });
    });


    describe('Test hashPlainPassword', () => {
        it("will be successful ", () => {
            let result = {"data" : {
                status: 0
            }};
           
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(authenticationService.hashPlainPassword(inputPassword, theSalt)).resolves.toEqual(result.data);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/create-hash', {password: inputPassword, salt: theSalt});
        });

        it("will be fail to hash the password ", () => {
            let result = { status: 1003, message: 'Internal Error' };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue("failed");
            expect(authenticationService.hashPlainPassword(inputPassword, theSalt)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/create-hash', {password: inputPassword, salt: theSalt});
        });

        it("toPromise will throw an exception ", () => {
            let result = { status: 1003, message: 'Internal Error' };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(authenticationService.hashPlainPassword(inputPassword, theSalt)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/create-hash', {password: inputPassword, salt: theSalt});
        });
    });

    describe('Test decryptPassword', () => {
        it("will be successful ", () => {
            let result = {"data" : {
                status: 0
            }};
           
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue(result);
            expect(authenticationService.decryptPassword(encryptedPassword)).resolves.toEqual(result.data);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/decrypt-rsa', {password: encryptedPassword});
        });

        it("will be fail to hash the password ", () => {
            let result = { status: 1003, message: 'Internal Error' };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockResolvedValue("failed");
            expect(authenticationService.decryptPassword(encryptedPassword)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/decrypt-rsa', {password: encryptedPassword});
        });

        it("toPromise will throw an exception ", () => {
            let result = { status: 1003, message: 'Internal Error' };
            httpService.post.mockImplementation(() => mockObservable);
            mockObservable.toPromise.mockRejectedValue(new Error('failed'));
            expect(authenticationService.decryptPassword(encryptedPassword)).resolves.toEqual(result);
            expect(httpService.post).toBeCalledWith('http://' + 'authenticator' +':' + '8260' + '/auth/decrypt-rsa', {password: encryptedPassword});
      });
    });

});