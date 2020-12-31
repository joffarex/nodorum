import { equals } from 'ramda';

interface ValueObjectProps {
  [index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  public props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(other: ValueObject<T>): boolean {
    if (this.constructor !== other.constructor) {
      return false;
    }
    return equals(this.props, other.props);
  }
}
