import { Test, TestingModule } from '@nestjs/testing';
import { SubnodditService } from './subnoddit.service';

describe('SubnodditService', () => {
  let service: SubnodditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubnodditService],
    }).compile();

    service = module.get<SubnodditService>(SubnodditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
