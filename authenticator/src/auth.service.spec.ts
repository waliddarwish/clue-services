


/* BEFORE
jest.mock('crypto');
jest.genMockFromModule('@akanass/nestjsx-crypto');
jest.mock('@akanass/nestjsx-crypto');
jest.enableAutomock();
jest.genMockFromModule('crypto');
*/




import { Test } from '@nestjs/testing';
import { AuthenticatorService } from './auth.service';
import { RsaService } from '@akanass/nestjsx-crypto';
import crypto = require('crypto');
import config = require('../config/config.json');



const originalBufferFrom = global.Buffer.from ;

const mockRsaService = {
  loadKey: jest.fn(),
  pipe: jest.fn(),
  subscribe: jest.fn()
};

const theCrypto = {
  createHmac: jest.fn(),
  update: jest.fn(),
  digest: jest.fn()
};

const mockObservable = {
  toPromise: jest.fn()

};

describe('Test authenticator service', () => {

  let autheticatorService;
  let rsaService;


  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2019-04-07T10:20:30Z').getTime());
  });


  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: RsaService, useFactory: () => { return mockRsaService } },
        { provide: AuthenticatorService, useValue: new AuthenticatorService(rsaService) },
      ]
    }).compile();
    rsaService = await module.get<RsaService>(RsaService);
    autheticatorService = await module.get<AuthenticatorService>(AuthenticatorService);
  });

  afterAll(() => {
    global.Date.now = Date.now;
    global.Buffer.from = originalBufferFrom;
  });

  it('test constructor', () => {
    //const authService = new AuthenticatorService(rsaService);
    //expect(authService).not.toEqual(null); 
    expect(autheticatorService).not.toEqual(null);
  });

  describe('Test validatePassword', () => {
    let password = 'password';
    let salt = 'salt';
    let internalPassword = 'internalPassword';
    const theToken = '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

    it('validate password successfully', async () => {
      const hashedText = crypto
        .createHmac('sha256', config.dbKey)
        .update('data' + salt + config.pepper)
        .digest('hex');

      internalPassword = hashedText;
      let mockHmac = {
        update: jest.fn(),
        digest: jest.fn().mockReturnValue(internalPassword)
      }
      crypto.randomBytes = jest.fn().mockReturnValue(Buffer.alloc(64));
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);
      mockHmac.update = jest.fn().mockReturnValue(mockHmac);

      let expectedResult = {
        status: 0,
        message: 'Success',
        data: { valid: true, token: theToken, created: new Date().getTime() },
      }

      autheticatorService.decryptRSAPrivate = jest.fn().mockReturnValue({ status: 0, data: 'data' });
      rsaService.loadKey.mockImplementation(() => mockRsaService);

      rsaService.subscribe.mockImplementation(() => mockRsaService);
      let actualResult = await autheticatorService.validatePassword(password, salt, internalPassword);
      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.data.valid).toEqual(expectedResult.data.valid);
      expect(actualResult.data.token).toEqual(expectedResult.data.token);
      expect(autheticatorService.decryptRSAPrivate).toHaveBeenCalled();
    });


    it('fail to decryptRSAPrivate', async () => {
      let rsaResult = { status: 10, data: 'Error decrypting rsa private' };
      autheticatorService.decryptRSAPrivate = jest.fn().mockReturnValue(rsaResult);
      let actualResult = await autheticatorService.validatePassword(password, salt, internalPassword);
      expect(actualResult).toEqual(rsaResult);
    });

    it('Fail because wrong internal password was provided', async () => {
      const hashedText = crypto
        .createHmac('sha256', config.dbKey)
        .update('data' + salt + config.pepper)
        .digest('hex');

      internalPassword = 'Not the hashed Text';
      let mockHmac = {
        update: jest.fn(),
        digest: jest.fn().mockReturnValue(internalPassword)
      };
      crypto.randomBytes = jest.fn().mockReturnValue(Buffer.alloc(64));
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);
      mockHmac.update = jest.fn().mockReturnValue(mockHmac);
      mockHmac.digest = jest.fn().mockReturnValue('hello');

      let expectedResult = { status: 1001, message: 'Failed', data: { valid: false } };

      autheticatorService.decryptRSAPrivate = jest.fn().mockReturnValue({ status: 0, data: 'data' });
      rsaService.loadKey.mockImplementation(() => mockRsaService);

      rsaService.subscribe.mockImplementation(() => mockRsaService);
      let actualResult = await autheticatorService.validatePassword(password, salt, internalPassword);
      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.data.valid).toEqual(expectedResult.data.valid);
      expect(autheticatorService.decryptRSAPrivate).toHaveBeenCalled();
      expect(crypto.randomBytes).not.toHaveBeenCalled();
    });
  });


  describe('Test createPasswordHash', () => {
    let password = 'password';
    let salt = 'salt';

    it('Create password hash successfully', async () => {

      autheticatorService.decryptRSAPrivate = jest.fn().mockReturnValue({ status: 0, data: 'data' });
      const hashedText = crypto
        .createHmac('sha256', config.dbKey)
        .update('data' + salt + config.pepper)
        .digest('hex');
      let expectedResult = { status: 0, message: 'Success', data: hashedText };

      let actualResult = await autheticatorService.createPasswordHash(password, salt);
      expect(autheticatorService.decryptRSAPrivate).toHaveBeenCalled();

      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.message).toEqual(expectedResult.message);
      expect(actualResult.data).toEqual(expectedResult.data);
    });

    it('fail to decryptRSAPrivate', async () => {
      let rsaResult = { status: 10, data: 'Error decrypting rsa private' };
      autheticatorService.decryptRSAPrivate = jest.fn().mockReturnValue(rsaResult);
      let actualResult = await autheticatorService.createPasswordHash(password, salt);
      expect(actualResult).toEqual(rsaResult);
    });

  });


  describe('Test decryptRSAPrivate', () => {
    let password = 'password';

    it('decrypt rsa private successfully', async () => {
      let loadKeyOutput = {
        pipe: jest.fn(),
        subscribe: jest.fn()
      };
      //global.Buffer.from = jest.fn(() => new Buffer('hello'));
      const spy = jest.spyOn(Buffer, 'from');
      spy.mockReturnValue(new Buffer('hello'));

      let base64Decoded;
      mockRsaService.loadKey = jest.fn().mockReturnValue(loadKeyOutput);
      loadKeyOutput.pipe = jest.fn().mockReturnValue(loadKeyOutput);
      loadKeyOutput.pipe = jest.fn().mockImplementation(() => {
        console.log('Mocked pipe');
      }).mockReturnValue(loadKeyOutput);

      loadKeyOutput.subscribe = jest.fn().mockImplementation(() => {
        base64Decoded = 'aGVsbG8='; // hello in plain text
      }).mockReturnValue(true);
      mockRsaService.subscribe = jest.fn().mockImplementation(() => {
        base64Decoded = 'aGVsbG8='; // hello in plain text
      }).mockReturnValue(true);

      let expectedResult = { status: 0, message: 'Success', data: 'hello' };
      let actualResult = await autheticatorService.decryptRSAPrivate(password);
      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.message).toEqual(expectedResult.message);
      expect(actualResult.data).toEqual(expectedResult.data);

    });

    /*
    it('fail to decrypt rsa key', async () => {
      let loadKeyOutput = {
        pipe: jest.fn(),
        subscribe: jest.fn()
      };
      //global.Buffer.from = jest.fn(() => new Buffer('hello'));
      const spy = jest.spyOn(Buffer, 'from');
      spy.mockReturnValue(new Buffer('hello'));

      let base64Decoded;
      mockRsaService.loadKey = jest.fn().mockReturnValue(loadKeyOutput);
      loadKeyOutput.pipe = jest.fn().mockReturnValue(loadKeyOutput);
      loadKeyOutput.pipe = jest.fn().mockImplementation(() => {
        console.log('Mocked pipe');
      }).mockReturnValue(loadKeyOutput);

      loadKeyOutput.subscribe = jest.fn().mockImplementation(() => {
        base64Decoded = 'aGVsbG8='; // hello in plain text
      }).mockReturnValue(true);
      mockRsaService.subscribe = jest.fn().mockImplementation(() => {
        base64Decoded = 'aGVsbG8='; // hello in plain text
      }).mockReturnValue(false);

      let expectedResult = { status: 1001, message: 'Failed', data: null};
      let actualResult = await autheticatorService.decryptRSAPrivate(password);
      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.message).toEqual(expectedResult.message);
      expect(actualResult.data).toEqual(expectedResult.data);

    });*/
  });


  describe('Test encryptRSAPublic', () => {
    let password = 'password';

    it('encrypt rsa public successfully', async () => {
      let loadKeyOutput = {
        pipe: jest.fn(),
        subscribe: jest.fn()
      };
      //global.Buffer.from = jest.fn(() => new Buffer('hello'));
      const spy = jest.spyOn(Buffer, 'from');
      spy.mockReturnValue(new Buffer('hello'));

      let base64Decoded;
      mockRsaService.loadKey = jest.fn().mockReturnValue(loadKeyOutput);
      loadKeyOutput.pipe = jest.fn().mockReturnValue(loadKeyOutput);
      loadKeyOutput.pipe = jest.fn().mockImplementation(() => {
        console.log('Mocked pipe');
      }).mockReturnValue(loadKeyOutput);

      loadKeyOutput.subscribe = jest.fn().mockImplementation(() => {
        base64Decoded = 'aGVsbG8='; // hello in plain text
      }).mockReturnValue(true);
      mockRsaService.subscribe = jest.fn().mockImplementation(() => {
        base64Decoded = 'aGVsbG8='; // hello in plain text
      }).mockReturnValue(true);

      let expectedResult = { status: 0, message: 'Success', data: undefined };
      let actualResult = await autheticatorService.encryptRSAPublic(password);
      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.message).toEqual(expectedResult.message);
      expect(actualResult.data).toEqual(expectedResult.data);

    });
  });


  describe('Test hashText', () => {
    let plainText = 'plainText';
    let salt = 'salt';


    it('hash the plain text successfully', async () => {
      const hashedText = crypto
        .createHmac('sha256', config.dbKey)
        .update(plainText + salt + config.pepper)
        .digest('hex');

      let expectedResult = { status: 0, message: 'Success', data: hashedText };
      let actualResult = await autheticatorService.hashText(plainText, salt);
      expect(actualResult.status).toEqual(expectedResult.status);
      expect(actualResult.message).toEqual(expectedResult.message);
      expect(actualResult.data).toEqual(expectedResult.data);
    });
  
  });


});