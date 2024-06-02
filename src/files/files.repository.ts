import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultRepository } from '@app/common';
import { File } from './entities/file.entity';

export class FileRepository extends DefaultRepository<File> {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {
    super(
      fileRepository.target,
      fileRepository.manager,
      fileRepository.queryRunner,
    );
  }
}
