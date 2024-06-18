import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileRepository } from './files.repository';
import { AccessControllModule } from '../access-controll/access-controll.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    AccessControllModule,
    UsersModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, FileRepository],
  exports: [FilesService, FileRepository],
})
export class FilesModule {}
