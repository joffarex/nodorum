import { ConflictException, InternalServerErrorException } from '@nestjs/common';

export class Guard {
  public static isNullOrUndefined<T>(value?: T): boolean {
    return value === undefined || value === null;
  }

  public static isDatabaseDuplicate(err: any, fields: string[]): void {
    if (err.code === '23505') {
      throw new ConflictException(
        `${fields.reduce((prev, next) => `${prev}, ${next}`, '').slice(0, -2)} has already been registered`,
      );
    } else {
      throw new InternalServerErrorException();
    }
  }
}
