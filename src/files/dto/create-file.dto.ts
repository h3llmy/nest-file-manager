import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsBoolean()
  hidden: boolean;

  @IsNotEmpty()
  @IsString()
  Size: number;
}
