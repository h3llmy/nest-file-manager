import { Module } from '@nestjs/common';
import { AccessControllService } from './access-controll.service';
import { AccessControllController } from './access-controll.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControl } from './entities/access-controll.entity';
import { AccessControllRepository } from './access-controll.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccessControl])],
  controllers: [AccessControllController],
  providers: [AccessControllService, AccessControllRepository],
  exports: [AccessControllService, AccessControllRepository],
})
export class AccessControllModule {}
