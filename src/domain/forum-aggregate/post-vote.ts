import { IsNotEmpty, IsUUID } from 'class-validator';
import { VoteType } from './vote-type';
import { v4 as uuid } from 'uuid';

export class PostVote {
  @IsUUID(4)
  @IsNotEmpty()
  private readonly _postVoteId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _userId: string;

  @IsUUID(4)
  @IsNotEmpty()
  private readonly _postId: string;

  @IsNotEmpty()
  private readonly _type: VoteType;

  private constructor(id: string, userId: string, postId: string, type: VoteType) {
    this._postVoteId = id;
    this._userId = userId;
    this._postId = postId;
    this._type = type;
  }

  public static create(userId: string, postId: string, type: VoteType): PostVote {
    return PostVote.createWithId(uuid(), userId, postId, type);
  }

  public static createWithId(id: string, userId: string, postId: string, type: VoteType): PostVote {
    return new PostVote(id, userId, postId, type);
  }

  public get postVoteId(): string {
    return this._postVoteId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get postId(): string {
    return this._postId;
  }

  public isUpVote(): boolean {
    return this._type === 'UP_VOTE';
  }

  public isDownVote(): boolean {
    return this._type === 'DOWN_VOTE';
  }
}
