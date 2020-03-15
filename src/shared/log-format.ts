import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

export const logFormat = (rcid: string, type: string, data: string, body: unknown, user: JwtPayload | null) =>
  JSON.stringify({ rcid, type, data, body, user });
