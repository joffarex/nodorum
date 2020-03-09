import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { v4 as uuid } from 'uuid';
import cls from 'cls-hooked';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

export class RequestContext {
  public static nsid = uuid();
  public readonly id: number;
  public request: FastifyRequest;
  public reply: FastifyReply<ServerResponse>;

  constructor(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    this.id = Math.random();
    this.request = request;
    this.reply = reply;
  }

  public static currentRequestContext(): RequestContext | null {
    const session = cls.getNamespace(RequestContext.nsid);

    if (session && session.active) {
      return session.get(RequestContext.name);
    }

    return null;
  }

  public static currentRequest(): FastifyRequest | null {
    const requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      return requestContext.request;
    }

    return null;
  }

  public static currentUser(): JwtPayload | null {
    const requestContext = RequestContext.currentRequestContext();

    if (requestContext && requestContext instanceof RequestContext) {
      const user: JwtPayload = requestContext.request.user;
      if (user) {
        return user;
      }
    }

    return null;
  }
}
