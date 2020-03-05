import { UserData } from 'src/app/user/interfaces/user.interface';

export class JwtDto {
  user?: UserData;
  accessToken!: string;
  refreshToken!: string;
}
