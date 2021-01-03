import { IsNotEmpty, IsUUID } from 'class-validator';
import { CommentVote } from './comment-vote';
import { v4 as uuid } from 'uuid';
import { Result } from '../../shared/core';
import { equals } from 'ramda';

export class Comment {
  @IsUUID(4)
  @IsNotEmpty()
  private readonly _commentId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _postId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _userId: string;

  private _votes: CommentVote[];
  private _points: number;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _parentCommentId: string;

  public get commentId(): string {
    return this._commentId;
  }

  public get postId(): string {
    return this._postId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get votes(): CommentVote[] {
    return this._votes;
  }

  public get points(): number {
    return this._points;
  }

  public get_parentCommentId(): string {
    return this._parentCommentId;
  }

  private constructor(
    id: string,
    postId: string,
    userId: string,
    votes: CommentVote[],
    points: number,
    parentCommentId: string,
  ) {
    this._commentId = id;
    this._postId = postId;
    this._userId = userId;
    this._votes = votes;
    this._points = points;
    this._parentCommentId = parentCommentId;
  }

  public static create(
    postId: string,
    userId: string,
    votes: CommentVote[],
    points: number,
    parentCommentId: string,
  ): Comment {
    return Comment.createWithId(uuid(), postId, userId, votes, points, parentCommentId);
  }

  public static createWithId(
    id: string,
    postId: string,
    userId: string,
    votes: CommentVote[],
    points: number,
    parentCommentId: string,
  ): Comment {
    return new Comment(id, postId, userId, votes, points, parentCommentId);
  }

  public addVote(vote: CommentVote): Result<void> {
    this._votes.push(vote);
    // event
    return Result.ok();
  }

  public removeVote(vote: CommentVote): Result<void> {
    this._votes = this._votes.filter((v) => !equals(v, vote));
    // event
    return Result.ok();
  }

  public updatePoints(upVotesCount: number, downVotesCount: number): void {
    this._points = upVotesCount - downVotesCount;
  }
}
