import { PostEntity } from '../post.entity';

export interface PostBody {
  post: PostEntity;
}

export interface PostsBody {
  posts: PostEntity[];
  postsCount: number;
}
