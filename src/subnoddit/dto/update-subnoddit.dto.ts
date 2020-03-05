import { SubnodditStatus } from '../subnoddit.entity';

export class UpdateSubnodditDto {
  name?: string;
  image?: string;
  about?: string;
  status?: SubnodditStatus;
}
