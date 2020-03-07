import fastify from 'fastify';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

declare module 'fastify' {
  interface FastifyRequest<
    HttpRequest,
    Query = fastify.DefaultQuery,
    Params = fastify.DefaultParams,
    Headers = fastify.DefaultHeaders,
    Body = any
  > {
    user: JwtPayload;
  }
}
