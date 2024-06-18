import { Injectable } from '@nestjs/common';
import { UpdateAccessControllDto } from './dto/update-access-controll.dto';
import { AccessControl } from './entities/access-controll.entity';
import { DeepPartial } from 'typeorm';
import { AccessControllRepository } from './access-controll.repository';

@Injectable()
export class AccessControllService {
  constructor(
    private readonly accessControllRepository: AccessControllRepository,
  ) {}

  create(createAccessControllDto: DeepPartial<AccessControl>) {
    return this.accessControllRepository.save(createAccessControllDto);
  }

  createMany(data: DeepPartial<AccessControl>[]) {
    return this.accessControllRepository.insert(data);
  }

  findAll() {
    return `This action returns all accessControll`;
  }

  findOne(id: string) {
    return this.accessControllRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  update(id: number, updateAccessControllDto: UpdateAccessControllDto) {
    return `This action updates a #${id} accessControll`;
  }

  remove(id: number) {
    return `This action removes a #${id} accessControll`;
  }
}
