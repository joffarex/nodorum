import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import jwt from 'jsonwebtoken';
import { v1 as uuidv1 } from 'uuid';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/app.logger';

export type Token = {
  id: string;
  userId: number;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}
  // TODO: implement redis store for refresh tokens via microservice
  private refreshTokens: Token[] = [];

  private jwtSecret = this.configService.get<string>('jwtSecret')
  private refreshSecret = this.configService.get<string>('session.refresh.secret')
  private issuer = this.configService.get<string>('uuid')
  private timeout = this.configService.get<number>('session.timeout')
  private refreshTimeout = this.configService.get<number>('session.refresh.timeout')
  private logger = new AppLogger('AuthService')

  public getAccessToken(payload: JwtPayload): string {

    if(!this.jwtSecret || !this.timeout || !this.issuer) {
      throw new InternalServerErrorException()
    }
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.timeout, issuer: this.issuer });
  }

  public getRefreshToken(payload: JwtPayload): string {
    const userRefreshTokens = this.refreshTokens.filter(token => token.userId === payload.id);

    // if user has multiple devices, it can have multiple refresh tokens
    if (userRefreshTokens.length >= 5) {
      this.refreshTokens = this.refreshTokens.filter(token => token.userId !== payload.id);
    }

    if(!this.jwtSecret || !this.refreshTimeout) {
      throw new InternalServerErrorException()
    }

    const refreshToken = jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTimeout });

    this.refreshTokens.push({
      id: uuidv1(),
      userId: payload.id,
      refreshToken,
    });

    return refreshToken;
  }

  public verifyJwtToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      if(!this.jwtSecret) {
        throw new InternalServerErrorException()
      }

      jwt.verify(token, this.jwtSecret, (err, decoded) => {
        if (err) {
          return reject(err.message);
        }

        if (!decoded) {
          console.log(decoded)
          console.log('Decoded does not exist')
          return reject('Token is invalid');
        }

        resolve(decoded as JwtPayload);
      });
    });
  }

  public getUpdatedRefreshToken(oldRefreshToken: string, payload: JwtPayload): string {
    if(!this.refreshSecret || !this.refreshTimeout) {
      throw new InternalServerErrorException()
    }
    // create new refresh token
    const newRefreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshTimeout });
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
    if(!this.jwtSecret ) {
      throw new InternalServerErrorException()
    }

    const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

    // TODO: implement this
    const {user} = await this.userService.findOne(decoded.id)

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
