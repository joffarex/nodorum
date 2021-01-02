import { JWTClaims, JWTToken, RefreshToken, User } from '../../../domain/user-aggregate';

export interface IAuthService {
  signJWT(props: JWTClaims): JWTToken;

  decodeJWT(token: string): JWTClaims;

  createRefreshToken(): RefreshToken;

  getTokens(username: string): Promise<string[]>;

  saveAuthenticatedUser(user: User): Promise<void>;

  deAuthenticateUser(username: string): Promise<void>;

  refreshTokenExists(refreshToken: RefreshToken): Promise<boolean>;

  getUsernameFromRefreshToken(refreshToken: RefreshToken): Promise<string>;
}
