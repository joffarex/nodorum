export const selectSpy = jest.fn().mockReturnThis();
export const leftJoinAndSelectSpy = jest.fn().mockReturnThis();
export const whereSpy = jest.fn().mockReturnThis();
export const getOneSpy = jest.fn();
export const getRawOneSpy = jest.fn();

export const mockRepositoryFactory = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: leftJoinAndSelectSpy,
    select: selectSpy,
    where: whereSpy,
    getOne: getOneSpy,
    getRawOne: getRawOneSpy,
  })),
}));
