import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccessControllService } from './access-controll.service';
import { CreateAccessControllDto } from './dto/create-access-controll.dto';
import { UpdateAccessControllDto } from './dto/update-access-controll.dto';

@Controller('access-controll')
export class AccessControllController {
  constructor(private readonly accessControllService: AccessControllService) {}

  @Post()
  create(@Body() createAccessControllDto: CreateAccessControllDto) {
    return this.accessControllService.create(createAccessControllDto);
  }

  @Get()
  findAll() {
    return this.accessControllService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessControllService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccessControllDto: UpdateAccessControllDto,
  ) {
    return this.accessControllService.update(+id, updateAccessControllDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessControllService.remove(+id);
  }
}
