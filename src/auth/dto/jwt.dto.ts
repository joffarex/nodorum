import { UserData } from '../../user/interfaces/user.interface';

export class JwtDto {
  user?: UserData;
  accessToken!: string;
  refreshToken!: string;
}
