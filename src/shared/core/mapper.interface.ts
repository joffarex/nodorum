export interface IMapper<TEntity, TDomain> {
  entityToDomain(entity: TEntity): TDomain;

  domainToEntity(domain: TDomain): TEntity;
}
