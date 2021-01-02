/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { AppLogger } from '../core';
import { ICryptoService } from './crypto-service.interface';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService implements ICryptoService {
  private readonly _logger = new AppLogger('CryptoService');
  private _algorithm = 'aes-256-ctr';
  private _iv = randomBytes(32);
  private _secret = this._configService.get<string>('crypto.secret');

  constructor(private readonly _configService: ConfigService) {}

  decrypt(hash: string): string {
    const decipher = createDecipheriv(this._algorithm, this._secret!, Buffer.from(this._iv.toString('hex'), 'hex'));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);

    return decrypted.toString();
  }

  encrypt(text: string): string {
    const cypher = createCipheriv(this._algorithm, this._secret!, this._iv);
    const encrypted = Buffer.concat([cypher.update(text), cypher.final()]);

    return encrypted.toString('hex');
  }

  randomBytes(): string {
    return randomBytes(48).toString('base64');
  }
}
