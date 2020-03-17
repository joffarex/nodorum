export const selectSpy = jest.fn().mockReturnThis();
export const leftJoinAndSelectSpy = jest.fn().mockReturnThis();
export const whereSpy = jest.fn().mockReturnThis();
export const andWhereSpy = jest.fn().mockReturnThis();
export const orderBySpy = jest.fn().mockReturnThis();
export const limitSpy = jest.fn().mockReturnThis();
export const offsetSpy = jest.fn().mockReturnThis();
export const getOneSpy = jest.fn();
export const findOneSpy = jest.fn();
export const findSpy = jest.fn();
export const getRawOneSpy = jest.fn();
export const getCountSpy = jest.fn();
export const getManySpy = jest.fn();
export const saveSpy = jest.fn();
export const deleteSpy = jest.fn();

export const mockRepositoryFactory = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: leftJoinAndSelectSpy,
    select: selectSpy,
    where: whereSpy,
    andWhere: andWhereSpy,
    getOne: getOneSpy,
    getRawOne: getRawOneSpy,
    getCount: getCountSpy,
    getMany: getManySpy,
    orderBy: orderBySpy,
    limit: limitSpy,
    offset: offsetSpy,
  })),
  findOne: findOneSpy,
  save: saveSpy,
  find: findSpy,
  delete: deleteSpy,
}));
