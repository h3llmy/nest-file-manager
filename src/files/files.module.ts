import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileRepository } from './files.repository';
import { FileSubscribers } from './entities/file.subscribers';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FilesController],
  providers: [FilesService, FileRepository, FileSubscribers],
  exports: [FilesService, FileRepository],
})
export class FilesModule {}
