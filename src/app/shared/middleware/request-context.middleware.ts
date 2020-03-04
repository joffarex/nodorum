import {Injectable, NestMiddleware} from '@nestjs/common';
import cls from 'cls-hooked';
import {RequestContext} from '../request-context';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
		use(request: FastifyRequest, reply: FastifyReply<ServerResponse>, next: () => void) {
			const requestContext = new RequestContext(request, reply);
			const session = cls.getNamespace(RequestContext.nsid) || cls.createNamespace(RequestContext.nsid);

			session.run(async () => {
				session.set(RequestContext.name, requestContext);
				next();
			});
		};
}