import { ValueObject } from '../seed-work';
import { compare, hash } from 'bcryptjs';
import { Guard, Result } from '../../shared/core';

interface IProps {
  value: string;
  hashed: boolean;
}

export class UserPassword extends ValueObject<IProps> {
  public props: IProps;
  public static minLength = 8;

  public constructor(props: IProps) {
    super(props);
    this.props = props;
  }

  get value(): string {
    return this.props.value;
  }

  public static async create(password: string, hashed = false): Promise<Result<UserPassword>> {
    if (Guard.isNullOrUndefined(password)) {
      return Result.fail('Password can not be empty');
    }

    if (password.length < this.minLength) {
      return Result.fail('Password must be at least 8 characters long');
    }

    let value: string;

    if (!hashed) {
      value = await hash(password, 10);
    } else {
      value = password;
    }

    return Result.ok(new UserPassword({ value, hashed }));
  }

  public async compare(plainPassword: string): Promise<boolean> {
    return await compare(plainPassword, this.props.value);
  }
}
