import { UserData } from '../../user/interfaces/user.interface';
import { CommentEntity } from '../comment.entity';

export interface PostData {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  user?: UserData;
}

export interface CommentBody {
  comment: CommentEntity;
}

export interface CommentsBody {
  comments: CommentEntity[];
  commentsCount: number;
}
