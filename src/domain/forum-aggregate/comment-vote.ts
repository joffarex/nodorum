import { IsNotEmpty, IsUUID } from 'class-validator';
import { VoteType } from './vote-type';
import { v4 as uuid } from 'uuid';

export class CommentVote {
  @IsUUID(4)
  @IsNotEmpty()
  private readonly _commentVoteId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _userId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _commentId: string;

  @IsNotEmpty()
  private readonly _type: VoteType;

  private constructor(id: string, userId: string, commentId: string, type: VoteType) {
    this._commentVoteId = id;
    this._userId = userId;
    this._commentId = commentId;
    this._type = type;
  }

  public static create(userId: string, commentId: string, type: VoteType): CommentVote {
    return CommentVote.createWithId(uuid(), userId, commentId, type);
  }

  public static createWithId(id: string, userId: string, commentId: string, type: VoteType): CommentVote {
    return new CommentVote(id, userId, commentId, type);
  }

  public get commentVoteId(): string {
    return this._commentVoteId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get commentId(): string {
    return this._commentId;
  }

  public isUpVote(): boolean {
    return this._type === 'UP_VOTE';
  }

  public isDownVote(): boolean {
    return this._type === 'DOWN_VOTE';
  }
}
