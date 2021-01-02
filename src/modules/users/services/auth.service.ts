/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../../shared/core';
import { IAuthService } from './auth-service.interface';
import { JWTClaims, JWTToken, RefreshToken, User } from '../../../domain/user-aggregate';
import { ICryptoService } from '../../../shared/services';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new AppLogger('AuthService');
  private _secret = this._configService.get<string>('auth.secret');
  private _tokenExpiryTime = this._configService.get<string>('auth.tokenExpiryTime');

  constructor(private readonly _cryptoService: ICryptoService, private readonly _configService: ConfigService) {}

  createRefreshToken(): RefreshToken {
    return this._cryptoService.randomBytes();
  }

  async deAuthenticateUser(username: string): Promise<void> {}

  decodeJWT(token: string): JWTClaims {
    return verify(token, this._secret!) as JWTClaims;
  }

  async getTokens(username: string): Promise<string[]> {}

  async getUsernameFromRefreshToken(refreshToken: RefreshToken): Promise<string> {}

  async refreshTokenExists(refreshToken: RefreshToken): Promise<boolean> {}

  async saveAuthenticatedUser(user: User): Promise<void> {}

  signJWT(props: JWTClaims): JWTToken {
    const claims: JWTClaims = {
      userId: props.userId,
      isEmailVerified: props.isEmailVerified,
      email: props.email,
      username: props.username,
    };

    return sign(claims, this._secret!, { expiresIn: this._tokenExpiryTime });
  }
}
