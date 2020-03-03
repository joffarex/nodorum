import { LoggerService } from '@nestjs/common';
import { transports, createLogger, Logger } from 'winston';
import { config } from '../config';

export class AppLogger implements LoggerService {
	private logger: Logger;

	constructor() {
		this.logger = createLogger({
			level: config.logger.level,
			transports: [
        new transports.File({ filename: 'quick-start-error.log', level: 'error' }),
        new transports.File({ filename: 'quick-start-combined.log' })
			]
		});
	}

	error(message: string, trace: string) {
		this.logger.error(message, trace);
	}

	warn(message: string) {
		this.logger.warn(message);
	}

	log(message: string) {
		this.logger.info(message);
	}

	verbose(message: string) {
		this.logger.verbose(message);
	}

	debug(message: string) {
		this.logger.debug(message);
	}

	silly(message: string) {
		this.logger.silly(message);
	}
}