import {
  Controller,
  Get,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationUserDto } from './dto/pagination-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, Permission } from '@app/common';
import { Role, User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permission(Role.ADMIN)
  findAllPagination(@Query() findQuery: PaginationUserDto) {
    return this.usersService.findAllPagination(findQuery);
  }

  @Get('profile')
  @Permission('Authorize')
  detailProfile(@Auth() user: any) {
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id, { file: true });
  }

  @Put('update-profile')
  @Permission('Authorize')
  update(@Auth() user: User, @Body() updateUserDto: UpdateUserDto) {
    this.usersService.update(user.id, updateUserDto);

    return { message: 'Update profile success' };
  }

  @Delete()
  @Permission(Role.ADMIN)
  deleteAll() {
    return this.usersService.deleteAll();
  }
}
