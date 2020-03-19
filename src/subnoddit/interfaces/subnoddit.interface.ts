import { UserEntity } from 'src/user/user.entity';

export interface SubnodditData {
  id: number;
  name: string;
  status?: 'ACTIVE' | 'NOT_ACTIVE';
  image?: string;
  about: string;
  createdAt?: string;
  updatedAt?: string;
  user: UserEntity;
}

export interface SubnodditBody {
  subnoddit: SubnodditData;
}

export interface SubnodditsBody {
  subnodditsCount: number;
  subnoddits: SubnodditData[];
}
