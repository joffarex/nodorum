export class FilterDto {
  username?: string;
  limit?: number;
  offset?: number;
  byVotes?: 'DESC' | 'ASC';
}
