import { LoggerService } from '@nestjs/common';
import { transports, createLogger, Logger, format } from 'winston';
import { config } from '../config';

const myFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export class AppLogger implements LoggerService {
	private logger: Logger;

	constructor(label: string) {
		this.logger = createLogger({
			level: config.logger.level,
			format: format.combine(format.label({label}), format.timestamp(), myFormat),
			transports: [
        new transports.File({ filename: 'quick-start-error.log', level: 'error' }),
				new transports.File({ filename: 'quick-start-combined.log' }),
				new transports.Console()
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