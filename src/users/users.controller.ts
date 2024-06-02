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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth, Permission } from '@app/common';
import { Role, User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Permission(Role.ADMIN)
  @ApiBearerAuth()
  findAllPagination(@Query() findQuery: PaginationUserDto) {
    return this.usersService.findAllPagination(findQuery);
  }

  @Get('profile')
  @Permission('Authorize')
  @ApiBearerAuth()
  detailProfile(@Auth() user: any) {
    return user;
  }

  @Get(':id')
  @Permission(Role.ADMIN)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id, { files: true });
  }

  @Put('update-profile')
  @Permission('Authorize')
  @ApiBearerAuth()
  update(@Auth() user: User, @Body() updateUserDto: UpdateUserDto) {
    this.usersService.update(user.id, updateUserDto);

    return { message: 'Update profile success' };
  }

  @Delete()
  @Permission(Role.ADMIN)
  @ApiBearerAuth()
  deleteAll() {
    return this.usersService.deleteAll();
  }
}
