import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorization: string = request.headers.authorization;
    if (!authorization) {
      return false;
    }

    if (!authorization.startsWith('Bearer')) {
      return false;
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      return false;
    }

    let user;

    try {
      user = await this.authService.verifyJwtToken(token);
    } catch (err) {
      throw new ForbiddenException(err);
    }

    request.user = user;

    return true;
  }
}
