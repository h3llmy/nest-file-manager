import { Test, TestingModule } from '@nestjs/testing';
import { RandomizeService } from './randomize.service';

describe('RandomizeService', () => {
  let service: RandomizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomizeService],
    }).compile();

    service = module.get<RandomizeService>(RandomizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
