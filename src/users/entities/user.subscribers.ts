import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from './user.entity';
import { EncryptionService } from '@app/encryption';
import { UserRepository } from '../users.repository';
import { BadRequestException } from '@nestjs/common';

@EventSubscriber()
export class UserSubscribers implements EntitySubscriberInterface<User> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly encryptionService: EncryptionService,
    private readonly userRepository: UserRepository,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof User {
    return User;
  }

  async beforeInsert({ entity }: InsertEvent<User>): Promise<void> {
    const userCheck = await this.userRepository.findOneBy({
      email: entity.email,
    });

    if (userCheck)
      throw new BadRequestException(`email ${entity.email} is already in used`);

    entity.password = this.encryptionService.hash(entity.password);
  }

  beforeUpdate({ entity }: UpdateEvent<User>): void {
    if (entity?.password) {
      entity.password = this.encryptionService.hash(entity.password);
    }
  }
}
