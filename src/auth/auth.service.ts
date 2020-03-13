import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import jwt from 'jsonwebtoken';
import { v1 as uuidv1 } from 'uuid';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { RedisClient } from 'src/shared/redis.provider';

export type Token = {
  id: string;
  userId: number;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {}

  private jwtSecret = this.configService.get<string>('jwtSecret');
  private refreshSecret = this.configService.get<string>('session.refresh.secret');
  private issuer = this.configService.get<string>('uuid');
  private timeout = this.configService.get<number>('session.timeout');
  private refreshTimeout = this.configService.get<number>('session.refresh.timeout');

  public getAccessToken(payload: JwtPayload): string {
    if (!this.jwtSecret || !this.timeout || !this.issuer) {
      throw new InternalServerErrorException();
    }
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.timeout, issuer: this.issuer });
  }

  public async getRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshTokens = await this.getRefreshTokens(payload.id);

    if (!this.jwtSecret || !this.refreshTimeout) {
      throw new InternalServerErrorException();
    }

    const refreshToken = jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTimeout });

    const token = {
      id: uuidv1(),
      userId: payload.id,
      refreshToken,
    };

    const updatedRefreshTokens = refreshTokens.push(token);

    await this.redisClient.set(`${payload.id}`, JSON.stringify(updatedRefreshTokens));

    // TODO: log updated refresh tokens

    return refreshToken;
  }

  public verifyJwtToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      if (!this.jwtSecret) {
        throw new InternalServerErrorException();
      }

      jwt.verify(token, this.jwtSecret, (err, decoded) => {
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

  public async getUpdatedRefreshToken(oldRefreshToken: string, payload: JwtPayload): Promise<string> {
    if (!this.refreshSecret || !this.refreshTimeout) {
      throw new InternalServerErrorException();
    }
    // create new refresh token
    const newRefreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshTimeout });

    const refreshTokens = await this.getRefreshTokens(payload.id);

    // replace current refresh token with new one
    const updatedRefreshTokens = refreshTokens.map(token => {
      if (token.refreshToken === oldRefreshToken) {
        return {
          ...token,
          refreshToken: newRefreshToken,
        };
      }

      return token;
    });

    await this.redisClient.set(`${payload.id}`, JSON.stringify(updatedRefreshTokens));

    return newRefreshToken;
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.jwtSecret) {
      throw new InternalServerErrorException();
    }

    const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

    const { user } = await this.userService.findOne(decoded.id);

    if (!user) {
      throw new ForbiddenException();
    }

    const refreshTokens = await this.getRefreshTokens(decoded.id);

    if (!refreshTokens || !refreshTokens.length) {
      throw new BadRequestException(`There is no refresh token for the user with`);
    }

    const currentRefreshToken = refreshTokens.find(refreshToken => refreshToken.refreshToken === token);

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
    const newRefreshToken = await this.getUpdatedRefreshToken(token, payload);
    const newAccessToken = this.getAccessToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async getRefreshTokens(id: number): Promise<Token[]> {
    const _refreshTokens = await this.redisClient.get(`${id}`);

    let refreshTokens: Token[];

    if (!_refreshTokens) {
      refreshTokens = [];
      return refreshTokens;
    }

    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    refreshTokens = JSON.parse(_refreshTokens!);

    return refreshTokens;
  }
}
