import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileRepository } from './files.repository';
import { User } from '../users/entities/user.entity';
import { File } from './entities/file.entity';
import { join } from 'path';
import fs from 'fs';
import { DataSource, DeepPartial, Like } from 'typeorm';
import { AccessControllService } from '../access-controll/access-controll.service';
import { UsersService } from '../users/users.service';
import { AccessControl } from '../access-controll/entities/access-controll.entity';
import { BasicSuccessSchema, IPaginationPayload } from '@app/common';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly accessControllService: AccessControllService,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    user: User,
    createFileDto: CreateFileDto,
  ): Promise<BasicSuccessSchema> {
    const fileData = createFileDto.file.map(
      (file): DeepPartial<File> => ({
        owner: user,
        hidden: createFileDto.hidden,
        name: file.originalFileName,
        size: file.fileSize,
        url: file.save(),
        mimeType: file.mimetype,
      }),
    );

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const fileRepository = transactionalEntityManager.getRepository(File);
      const accessControlRepo =
        transactionalEntityManager.getRepository(AccessControl);

      const savedFiles = await fileRepository.save(fileData);

      let accessControls: DeepPartial<AccessControl>[] = [];

      if (createFileDto?.user) {
        const users = await this.userService.findMany(createFileDto.user);
        accessControls = savedFiles.map((file) => ({
          file,
          users,
          isPublic: false,
          canRead: createFileDto.canRead,
          grantedBy: user,
          canWrite: createFileDto.canWrite,
          canDelete: createFileDto.canDelete,
        }));
      } else {
        accessControls = savedFiles.map((file) => ({
          file,
          isPublic: createFileDto.isPublic,
          canRead: createFileDto.canRead,
          grantedBy: user,
          canWrite: createFileDto.canWrite,
          canDelete: createFileDto.canDelete,
        }));
      }

      await accessControlRepo.save(accessControls);
      return { message: 'Success to upload file' };
    });
  }

  findAll(paginationPayload: any) {
    const { search, ...paginationQuery } = paginationPayload;
    const query: IPaginationPayload<File> = {
      relations: ['owner'],
      ...paginationQuery,
    };
    if (search) {
      query.where = [
        { name: Like(`%${search}%`) },
        { mimeType: Like(`%${search}%`) },
      ];
    }
    return this.fileRepository.findPagination(query);
  }

  findOne(id: string) {
    return this.fileRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
      },
    });
  }

  async stream(id: string) {
    const file = await this.fileRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File ${id} not found`);
    }

    const filePath = join(process.cwd(), file.url);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${id} not found`);
    }

    return {
      filePath,
      file,
    };
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
