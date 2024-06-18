import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  Header,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { CreateFileDto } from './dto/create-file.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Auth, BasicErrorSchema, Permission } from '@app/common';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @Permission('Authorize')
  @ApiBearerAuth()
  @ApiUnprocessableEntityResponse({
    description: 'Validation Error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: {
          type: 'object',
          properties: {
            file: {
              type: 'array',
              items: { type: 'string' },
            },
            hidden: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  create(@Auth() user: User, @Body() createFileDto: CreateFileDto) {
    return this.filesService.create(user, createFileDto);
  }

  @Get()
  @Permission('Authorize')
  @ApiBearerAuth()
  findAll(@Query() findQuery: any) {
    return this.filesService.findAll(findQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get('stream/:id')
  @ApiParam({ name: 'id', required: true, description: 'File ID' })
  @ApiOkResponse({
    description: 'File streamed successfully',
    content: {
      'application/octet-stream': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: BasicErrorSchema,
  })
  @Header('Cross-Origin-Resource-Policy', '*')
  async stream(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const { filePath, file } = await this.filesService.stream(id);
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });

      res.status(206).header({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': file.mimeType,
      });

      fileStream.pipe(res);
    } else {
      const fileStream = createReadStream(filePath);
      res.header({
        'Content-Length': fileSize,
        'Content-Type': file.mimeType,
      });

      fileStream.pipe(res);
    }
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
