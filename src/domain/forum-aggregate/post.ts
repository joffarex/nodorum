import { AggregateRoot } from '../seed-work';
import { Comment } from './comment';
import { PostVote } from './post-vote';
import { IsInt, isInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { v4 as uuid } from 'uuid';
import { Guard, Result } from '../../shared/core';
import { equals } from 'ramda';
import { PostType } from './post-type';

export class Post extends AggregateRoot {
  @IsUUID(4)
  @IsNotEmpty()
  private readonly _postId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _userId: string;

  @IsNotEmpty()
  private readonly _title: string;

  @IsNotEmpty()
  private readonly _type: PostType;

  private _text?: string;
  private _link?: string;
  private _comments: Comment[];

  @IsInt()
  @Min(0)
  private readonly _totalComments: number;

  private _votes: PostVote[];
  private _points: number;

  private readonly _datePosted?: Date;

  public get postId(): string {
    return this._postId;
  }

  public get title(): string {
    return this._title;
  }

  public get type(): string {
    return this._type;
  }

  public get text(): string | undefined {
    return this._text;
  }

  public get link(): string | undefined {
    return this._link;
  }

  public get comments(): Comment[] {
    return this._comments;
  }

  public get totalComments(): number {
    return this._totalComments;
  }

  public get votes(): PostVote[] {
    return this._votes;
  }

  public get points(): number {
    return this._points;
  }

  public get datePosted(): Date | undefined {
    return this._datePosted;
  }

  private constructor(
    id: string,
    userId: string,
    title: string,
    type: PostType,
    totalComments: number,
    points: number,
    datePosted: Date,
  ) {
    super();

    this._postId = id;
    this._userId = userId;
    this._title = title;
    this._type = type;
    this._totalComments = totalComments;
    this._points = points;
    this._datePosted = datePosted;
    this._votes = [];
    this._comments = [];
  }

  public aggregateId(): string {
    return this._postId;
  }

  public static create(
    userId: string,
    title: string,
    type: PostType,
    totalComments: number,
    points: number,
    datePosted: Date,
  ): Post {
    return Post.createWithId(uuid(), userId, title, type, totalComments, points, datePosted);
  }

  public static createWithId(
    id: string,
    userId: string,
    title: string,
    type: PostType,
    totalComments: number,
    points: number,
    datePosted: Date,
  ): Post {
    const post = new Post(id, userId, title, type, totalComments, points, datePosted);
    // event
    return post;
  }

  public hasComments(): boolean {
    return this._totalComments !== 0;
  }

  public updateText(text: string): Result<void> {
    if (Guard.isNullOrUndefined(text)) {
      return Result.fail<void>('Text is null or undefined');
    }

    this._text = text;

    return Result.ok();
  }

  public updateLink(link: string): Result<void> {
    if (Guard.isNullOrUndefined(link)) {
      return Result.fail<void>('Link is null or undefined');
    }

    this._link = link;

    return Result.ok();
  }

  public updatePoints(upVotesCount: number, downVotesCount: number): void {
    this._points = upVotesCount - downVotesCount;
  }

  public addVote(vote: PostVote): Result<void> {
    this._votes.push(vote);
    // event
    return Result.ok();
  }

  public removeVote(vote: PostVote): Result<void> {
    this._votes = this._votes.filter((v) => !equals(v, vote));
    // event
    return Result.ok();
  }

  public addComment(comment: Comment): Result<void> {
    this._comments.push(comment);
    // event
    return Result.ok();
  }

  public removeComment(comment: Comment): Result<void> {
    this._comments = this._comments.filter((c) => !equals(c, comment));
    // event
    return Result.ok();
  }

  public updateComment(comment: Comment): Result<void> {
    this._comments = this._comments.filter((c) => c.commentId !== comment.commentId);

    this._comments.push(comment);
    // event
    return Result.ok();
  }

  public isLinkPost(): boolean {
    return this._type === 'link';
  }

  public isTextPost(): boolean {
    return this._type === 'text';
  }
}
