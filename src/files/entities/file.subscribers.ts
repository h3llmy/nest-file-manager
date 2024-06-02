import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  LoadEvent,
} from 'typeorm';
import { File } from './file.entity';
import { ConfigService } from '@nestjs/config';

@EventSubscriber()
export class FileSubscribers implements EntitySubscriberInterface<File> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof File {
    return File;
  }

  afterLoad(entity: File, event?: LoadEvent<File>): void | Promise<any> {
    if (event.entity.url) {
      const baseUrl = this.configService.get<string>('BASE_URL');
      entity.url = `${baseUrl}/${entity.url}`;
    }
  }
}
