import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { CreateFileDto } from './dto/create-file.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth, Permission } from '@app/common';
import { Role, User } from 'src/users/entities/user.entity';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @Permission('Authorize')
  @ApiBearerAuth()
  create(@Auth() user: User, @Body() createFileDto: CreateFileDto) {
    return this.filesService.create(user, createFileDto);
  }

  @Get()
  // @Permission(Role.ADMIN)
  @ApiBearerAuth()
  findAll(@Query() findQuery: any) {
    return this.filesService.findAll(findQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
