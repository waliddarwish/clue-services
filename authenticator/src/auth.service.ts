import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import crypto = require('crypto');
import config = require('../config/config.json');
import { RsaService } from '@akanass/nestjsx-crypto';
import {
  decryptPrivate,
} from '@akanass/nestjsx-crypto/operators/rsa';
import { encryptPublic } from '@akanass/nestjsx-crypto/operators/rsa';

let privateKey;
let publicKey;
@Injectable()
export class AuthenticatorService {
  constructor(
    private readonly rsaService: RsaService,
  ) {
    privateKey = fs.readFileSync('./keys/clue_private_key.pem');
    publicKey = fs.readFileSync('./keys/clue_puplic_key.pem');
  }

  private config: any;

  public setConfiguration(aConfig: any): void {
    this.config = aConfig;
  }

  /**
   * 1. decrypt password using private key.
   * 2. encrypt password using db key
   * 3. compare both passwords.
   * @param password
   * @param internalPassword
   */
  async validatePassword(
    password: string,
    salt: string,
    internalPassword: string,
  ): Promise<any> {
    const decryptionResult = this.decryptRSAPrivate(password);
    if (decryptionResult.status !== 0 ) {
      return decryptionResult;
    }
    const hashedText = crypto
      .createHmac('sha256', config.dbKey)
      .update(decryptionResult.data + salt + config.pepper)
      .digest('hex');
    if (internalPassword === hashedText) {
      const theToken = crypto.randomBytes(64).toString('hex');
      return {
        status: 0,
        message: 'Success',
        data: { valid: true, token: theToken, created: new Date().getTime() },
      };
    } else {
      return { status: 1001, message: 'Failed', data: { valid: false } };
    }
  }

  async createPasswordHash(password: string, salt: string): Promise<any> {
    const decryptionResult = this.decryptRSAPrivate(password);
    if (decryptionResult.status !== 0) {
      return decryptionResult;
    }
    const hashedText = crypto
      .createHmac('sha256', config.dbKey)
      .update(decryptionResult.data + salt + config.pepper)
      .digest('hex');
    return { status: 0, message: 'Success', data: hashedText };
  }

  decryptRSAPrivate(password: string): any {
    let plainPassword: string;
    let base64Decoded;
    let errorMassage;
    let status = true;
    this.rsaService
      .loadKey(privateKey)
      .pipe(decryptPrivate(password, 'base64'))
      .subscribe(
        (buffer: Buffer) => (base64Decoded = buffer.toString('utf-8')), // Show decrypted `Buffer` in the console
        e => { console.error(e.message);
               errorMassage = e.message;
               status = false;
        }, // Show error message in the console
      );
    if (!status) {
        return {status: 1001, message: errorMassage};
      }
    plainPassword = Buffer.from(base64Decoded, 'base64').toString('utf8');
    return {status: 0, message: 'Success', data: plainPassword};
  }

  encryptRSAPublic(plainTextPassword: string): any {
    let encryptedPassword;
    let status = true;
    let errorMassage;
    this.rsaService
      .loadKey(publicKey)
      .pipe(encryptPublic(plainTextPassword, 'base64'))
      .subscribe(
        (buffer: Buffer) => (encryptedPassword = buffer), // Show encrypted `Buffer` in the console
        e => {
          status = false;
          errorMassage = e.message;
        },
      );
    if (!status) {
        return { status: 1001, message: errorMassage, data: null };
    }
    return { status: 0, message: 'Success', data: encryptedPassword };
  }

  hashText(plainText: string, salt: string): any {
    const hashedText = crypto
      .createHmac('sha256', config.dbKey)
      .update(plainText + salt + config.pepper)
      .digest('hex');
    return { status: 0, message: 'Success', data: hashedText };
  }
}
