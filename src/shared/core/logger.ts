import { LoggerService } from '@nestjs/common';
import { transports, createLogger, Logger, format } from 'winston';

const customFormat = format.printf(({ level, message, label, timestamp }) => {
  const data = {
    timestamp,
    message,
    label,
    level,
  };
  return JSON.stringify(data);
});

export class AppLogger implements LoggerService {
  private logger: Logger;

  constructor(label: string) {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.label({ label }), format.timestamp(), customFormat),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'out.log', level: 'debug' }),
        new transports.Console({ level: 'info' }),
      ],
    });
  }

  error(message: string) {
    this.logger.error(message);
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
}
