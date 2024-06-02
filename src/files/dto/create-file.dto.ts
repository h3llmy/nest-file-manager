import { FileData, HasMimeType, MimeType, MinFileSize } from '@app/common';
import { IsFileData } from '@app/common';
import { MaxFileSize } from '@app/common/decorator/validator/maxFileSize.decorator';
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
  @IsFileData()
  @MinFileSize(5000)
  @MaxFileSize(10000000000000)
  @HasMimeType([MimeType['image/jpeg'], MimeType['image/png']])
  file: FileData;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  hidden: boolean;
}
