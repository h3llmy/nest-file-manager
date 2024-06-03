import {
  FileData,
  HasMimeType,
  MimeType,
  MinFileSize,
  IsFileData,
  MaxFileSize,
} from '@app/formdata';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    name: 'file',
  })
  @IsNotEmpty()
  @IsFileData({ each: true })
  @MinFileSize(5000, { each: true })
  @MaxFileSize(10000000000000, { each: true })
  @IsArray()
  @HasMimeType([MimeType['image/jpeg'], MimeType['image/png']], { each: true })
  file: FileData[];

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  hidden: boolean;
}
