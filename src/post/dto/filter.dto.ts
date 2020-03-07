export class FilterDto {
  username?: string;
  limit?: number;
  offset?: number;
  subnodditId?: number;
  byVotes?: 'DESC' | 'ASC';
}
