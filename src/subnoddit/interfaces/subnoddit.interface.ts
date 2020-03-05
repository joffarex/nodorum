export interface SubnodditData {
  id: number;
  name: string;
  status?: 'ACTIVE' | 'NOT_ACTIVE';
  image?: string;
  about: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubnodditBody {
  subnoddit: SubnodditData;
}
