import { AggregateRoot } from '../seed-work';
import { IsEmail, IsNotEmpty, IsUUID, MinLength } from 'class-validator';
import { UserCreatedEvent, UserDeletedEvent, UserEmailVerifiedEvent } from './events';
import { v4 as uuid } from 'uuid';
import { UserPassword } from './user-password';
import { JWTToken, RefreshToken } from './jwt';

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

  private readonly _password: UserPassword;

  private constructor(id: string, username: string, email: string, password: UserPassword) {
    super();

    this._userId = id;
    this._username = username;
    this._email = email;
    this._password = password;
    this._isEmailVerified = false;
    this._isDeleted = false;
  }

  public aggregateId(): string {
    return this._userId;
  }

  public static create(username: string, email: string, password: UserPassword): User {
    return User.createWithId(uuid(), username, email, password);
  }

  public static createWithId(id: string, username: string, email: string, password: UserPassword): User {
    const user = new User(id, username, email, password);
    user.apply(new UserCreatedEvent(user));
    return user;
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

  public set isDeleted(value: boolean) {
    this._isDeleted = value;
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

  public get password(): UserPassword {
    return this._password;
  }

  public get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }

  public set isEmailVerified(value: boolean) {
    this._isEmailVerified = value;
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

  public setAccessToken(accessToken: JWTToken, refreshToken: RefreshToken): void {
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
    this._lastLogin = new Date();
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
