import { PartialType } from '@nestjs/swagger';
import { CreateAccessControllDto } from './create-access-controll.dto';

export class UpdateAccessControllDto extends PartialType(CreateAccessControllDto) {}
