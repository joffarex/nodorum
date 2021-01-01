import { AppLogger } from './logger';

export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error?: T | string | null;
  private readonly _value?: T | null;
  protected logger = new AppLogger('Result');

  public constructor(isSuccess: boolean, error?: T | string | null, value?: T | null) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;

    Object.freeze(this);
  }

  public get value(): T {
    if (!this.isSuccess || !this._value) {
      if (this.error) this.logger.log(String(this.error));
      throw new Error("Can't get the value of an error result. Use 'errorValue' instead.");
    }

    return this._value;
  }

  public errorValue(): T {
    return this.error as T;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: U): Result<U> {
    return new Result<U>(false, error, null);
  }
}

export type Either<L, A> = Fail<L, A> | Success<L, A>;

export class Fail<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isFail(): this is Fail<L, A> {
    return true;
  }

  isSuccess(): this is Success<L, A> {
    return false;
  }
}

export class Success<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isFail(): this is Fail<L, A> {
    return false;
  }

  isSuccess(): this is Success<L, A> {
    return true;
  }
}

export const fail = <L, A>(l: L): Either<L, A> => {
  return new Fail(l);
};

export const success = <L, A>(a: A): Either<L, A> => {
  return new Success<L, A>(a);
};
