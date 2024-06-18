import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultRepository } from '@app/common';
import { AccessControl } from './entities/access-controll.entity';

export class AccessControllRepository extends DefaultRepository<AccessControl> {
  constructor(
    @InjectRepository(AccessControl)
    private accessControllRepository: Repository<AccessControl>,
  ) {
    super(
      accessControllRepository.target,
      accessControllRepository.manager,
      accessControllRepository.queryRunner,
    );
  }
}
