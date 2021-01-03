import { RefreshToken } from '../../../domain/user-aggregate';

export class RefreshAccessTokenCommand {
  constructor(public readonly refreshToken: RefreshToken) {}
}
