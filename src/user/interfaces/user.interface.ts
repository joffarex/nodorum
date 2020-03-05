export interface UserData {
  id: number;
  username: string;
  email: string;
  status?: 'NOT_VERIFIED' | 'VERIFIED';
  displayName?: string;
  image?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  // deletedAt: string | null;
}

export interface UserBody {
  user: UserData;
}
