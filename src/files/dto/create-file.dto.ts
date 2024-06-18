import {
  FileData,
  HasMimeType,
  MimeType,
  MinFileSize,
  IsFileData,
  MaxFileSize,
} from 'nestjs-formdata-interceptor';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    name: 'file[]',
  })
  @IsNotEmpty()
  @IsFileData({ each: true })
  @MinFileSize(5000, { each: true })
  @MaxFileSize(10000000000000, { each: true })
  @IsArray()
  @HasMimeType(
    [MimeType['image/jpeg'], MimeType['image/png'], MimeType['video/mp4']],
    { each: true },
  )
  file: FileData[];

  @ApiProperty({
    required: false,
    type: 'array',
    items: { type: 'string' },
    name: 'user[]',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o: CreateFileDto) => !!o.user)
  user?: string[];

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  hidden: boolean;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  isPublic: boolean;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  canRead: boolean;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  canWrite: boolean;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  canDelete: boolean;
}
