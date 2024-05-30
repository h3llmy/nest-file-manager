import { IsMatchWith } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsMatchWith('password')
  confirmPassword: string;
}
