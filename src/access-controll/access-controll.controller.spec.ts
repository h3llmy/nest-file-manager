import { Test, TestingModule } from '@nestjs/testing';
import { AccessControllController } from './access-controll.controller';
import { AccessControllService } from './access-controll.service';

describe('AccessControllController', () => {
  let controller: AccessControllController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessControllController],
      providers: [AccessControllService],
    }).compile();

    controller = module.get<AccessControllController>(AccessControllController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
