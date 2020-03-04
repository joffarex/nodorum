import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { AppLogger } from '../../app.logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new AppLogger('HTtpError');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply<ServerResponse>>();
    // const request = ctx.getRequest<FastifyRequest>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (typeof exception === 'string') {
      exception = new HttpException({ error: 'Undefined', message: exception }, status);
    }

    if (typeof exception.message === 'string') {
      exception = new HttpException({ error: 'Undefined', message: exception.message }, status);
    }

    if (exception.stack) {
      this.logger.error(`[${exception.message.error}] ${exception.message.message}`, exception.stack);
    }

    reply.status(status).send({
      statusCode: status,
      ...(exception.getResponse() as object),
      timestamp: new Date().toISOString(),
    });
  }
}
