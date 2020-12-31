export class Guard {
  public static isNullOrUndefined(value?: string): boolean {
    return value === undefined || value === null || value.length === 0;
  }
}
