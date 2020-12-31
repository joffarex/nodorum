import { DomainError } from './domain-error';
import { Result } from './result';
import { AppLogger } from './logger';

export class UnexpectedError extends Result<DomainError> {
  protected logger = new AppLogger('UnexpectedError');

  public constructor(err: any) {
    super(false, {
      message: `An unexpected error occurred.`,
      error: err,
    } as DomainError);
    this.logger.log(`[AppError]: An unexpected error occurred`);
    this.logger.error(err);
  }

  public static create(err: any): UnexpectedError {
    return new UnexpectedError(err);
  }
}
