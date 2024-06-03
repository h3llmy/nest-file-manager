import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileRepository } from './files.repository';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FilesService {
  constructor(private readonly fileRepository: FileRepository) {}

  async create(user: User, createFileDto: CreateFileDto) {
    // await this.fileRepository.save({
    //   owner: user,
    //   hidden: createFileDto.hidden,
    //   name: createFileDto.file.originalFileName,
    //   size: createFileDto.file.fileSize,
    //   url: createFileDto.file.filePath,
    //   mimeType: createFileDto.file.mimetype,
    // });

    createFileDto.file.forEach((file) => {
      file.save();
    });
    return { message: 'Success to upload file' };
  }

  findAll(findQuery: any) {
    return this.fileRepository.findPagination({
      page: 1,
      limit: 10,
      relations: ['owner'],
    });
  }

  findOne(id: number) {
    return this.fileRepository.findOne({
      relations: {
        owner: true,
      },
    });
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    console.log(updateFileDto);

    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
