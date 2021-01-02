export interface IMapper<TEntity, TDomain> {
  entityToDomain(entity: TEntity): Promise<TDomain>;

  domainToEntity(domain: TDomain): TEntity;
}
