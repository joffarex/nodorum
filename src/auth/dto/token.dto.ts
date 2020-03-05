export class TokenDto {
  id!: number;
  expiresIn!: number;
  audience!: string;
  issuer!: string;
}

export class AuthTokenDto {
  expiresIn!: number;
  accessToken!: string;
  refreshToken!: string;
}
