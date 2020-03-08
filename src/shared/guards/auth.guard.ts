import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  // constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorization: string = request.headers.authorization;
    if (!authorization) {
      return false;
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      return false;
    }

    // const user = await this.authService.verifyJwtToken(token);

    // if (!user) {
    //   return false;
    // }

    // request.user = user;

    return true;
  }
}
