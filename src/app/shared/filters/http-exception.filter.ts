import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';
import {AppLogger} from '../../app.logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private logger = new AppLogger();

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		let status = HttpStatus.BAD_REQUEST;

		if (typeof exception === 'string') {
			exception = new HttpException({error: 'Undefined', message: exception}, status);
		}

		if (typeof exception.message === 'string') {
			exception = new HttpException({error: 'Undefined', message: exception.message}, status);
		}

		if (exception.getStatus) {
			status = exception.getStatus();
		}

    if(exception.stack) {
    this.logger.error(`[${exception.message.error}] ${exception.message.message}`, exception.stack);
    }

		response
			.status(status)
			.json({
				statusCode: status,
				...exception.getResponse() as object,
				timestamp: new Date().toISOString()
			});
	}
}