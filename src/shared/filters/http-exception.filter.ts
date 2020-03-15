import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { AppLogger } from '../../app.logger';
import { logFormat } from '../log-format';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new AppLogger('HttpError');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply<ServerResponse>>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    const body = request.body ? request.body : {};
    const user = request.user ? request.user : null;

    if (typeof exception.message === 'string') {
      exception = new HttpException({ error: 'Undefined', message: exception.message }, status);
    }

    if (exception.stack) {
      this.logger.error(
        logFormat(request.rcid, `${exception.message.error}`, `message: ${exception.message.message}`, body, user),
      );
      this.logger.error(logFormat(request.rcid, `${exception.message.error} STACK`, exception.stack, body, user));
    }

    reply.status(status).send({
      statusCode: status,
      ...(exception.getResponse() as object),
      timestamp: new Date().toISOString(),
    });
  }
}
