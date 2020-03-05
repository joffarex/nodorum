import { Test, TestingModule } from '@nestjs/testing';
import { SubnodditController } from './subnoddit.controller';

describe('Subnoddit Controller', () => {
  let controller: SubnodditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubnodditController],
    }).compile();

    controller = module.get<SubnodditController>(SubnodditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
