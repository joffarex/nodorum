import { AggregateRoot } from '../seed-work';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import { UserDeletedEvent, UserEmailVerifiedEvent } from './events';
import { v4 as uuid } from 'uuid';

export class User extends AggregateRoot {
  @IsUUID(4)
  @IsNotEmpty()
  private readonly _userId: string;

  @IsNotEmpty()
  private readonly _username: string;

  @IsEmail()
  @IsNotEmpty()
  private readonly _email: string;

  private _isEmailVerified: boolean;
  private _accessToken?: string;
  private _refreshToken?: string;

  private _isDeleted: boolean;
  private _lastLogin?: Date;

  constructor(username: string, email: string, isEmailVerified: boolean, isDeleted: boolean) {
    super();

    this._userId = uuid();
    this._username = username;
    this._email = email;
    this._isEmailVerified = isEmailVerified;
    this._isDeleted = isDeleted;
  }

  public aggregateId(): string {
    return this._userId;
  }

  public isLoggedIn(): boolean {
    return !!this._accessToken && !!this._refreshToken;
  }

  public get lastLogin(): Date | undefined {
    return this._lastLogin;
  }
  public set lastLogin(value: Date | undefined) {
    this._lastLogin = value;
  }
  public get isDeleted(): boolean {
    return this._isDeleted;
  }
  public get refreshToken(): string | undefined {
    return this._refreshToken;
  }
  public set refreshToken(value: string | undefined) {
    this._refreshToken = value;
  }
  public get accessToken(): string | undefined {
    return this._accessToken;
  }
  public set accessToken(value: string | undefined) {
    this._accessToken = value;
  }
  public get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }
  public get email(): string {
    return this._email;
  }
  public get username(): string {
    return this._username;
  }
  public get userId(): string {
    return this._userId;
  }

  public verifyEmail(): void {
    if (this._isEmailVerified) {
      return;
    }

    this.apply(new UserEmailVerifiedEvent(this));
    this._isEmailVerified = true;
  }

  public delete(): void {
    if (this._isDeleted) {
      return;
    }

    this.apply(new UserDeletedEvent(this.userId));
    this._isDeleted = true;
  }
}
