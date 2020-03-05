import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import jwt from 'jsonwebtoken';
import { v1 as uuidv1 } from 'uuid';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { config } from 'src/config';

export type Token = {
  id: string;
  userId: number;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  // TODO: implement redis store for refresh tokens via microservice
  private refreshTokens: Token[] = [];

  public getAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.session.timeout, issuer: config.uuid });
  }

  public getRefreshToken(payload: JwtPayload): string {
    const userRefreshTokens = this.refreshTokens.filter(token => token.userId === payload.id);

    // if user has multiple devices, it can have multiple refresh tokens
    if (userRefreshTokens.length >= 5) {
      this.refreshTokens = this.refreshTokens.filter(token => token.userId !== payload.id);
    }

    const refreshToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.session.refresh.secret });

    this.refreshTokens.push({
      id: uuidv1(),
      userId: payload.id,
      refreshToken,
    });

    return refreshToken;
  }

  public verifyJwtToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      if (!token.startsWith('Bearer')) {
        return reject('Token is invalid');
      }

      token = token.slice(7, token.length);

      jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
          return reject(err.message);
        }

        if (!decoded) {
          return reject('Token is invalid');
        }

        resolve(decoded as JwtPayload);
      });
    });
  }

  public getUpdatedRefreshToken(oldRefreshToken: string, payload: JwtPayload): string {
    // create new refresh token
    const newRefreshToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.session.refresh.secret });
    // replace current refresh token with new one
    this.refreshTokens = this.refreshTokens.map(token => {
      if (token.refreshToken === oldRefreshToken) {
        return {
          ...token,
          refreshToken: newRefreshToken,
        };
      }

      return token;
    });

    return newRefreshToken;
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // TODO: implement this
    const { user } = await this.userService.findOne(decoded.id);

    if (!user) {
      throw new ForbiddenException();
    }

    const allRefreshTokens = this.refreshTokens.filter(refreshToken => refreshToken.userId === user.id);

    if (!allRefreshTokens || !allRefreshTokens.length) {
      throw new BadRequestException(`There is no refresh token for the user with`);
    }

    const currentRefreshToken = allRefreshTokens.find(refreshToken => refreshToken.refreshToken === token);

    if (!currentRefreshToken) {
      throw new BadRequestException(`Refresh token is wrong`);
    }

    // user's data for new tokens
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    // get new refresh and access token
    const newRefreshToken = this.getUpdatedRefreshToken(token, payload);
    const newAccessToken = this.getAccessToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
