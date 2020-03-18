export class FilterDto {
  limit?: number;
  offset?: number;
  byVotes?: 'DESC' | 'ASC';
}
