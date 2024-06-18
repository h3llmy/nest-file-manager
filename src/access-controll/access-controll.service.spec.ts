import { Test, TestingModule } from '@nestjs/testing';
import { AccessControllService } from './access-controll.service';

describe('AccessControllService', () => {
  let service: AccessControllService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessControllService],
    }).compile();

    service = module.get<AccessControllService>(AccessControllService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
