import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CommonModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [CommonModule, UsersModule, AuthModule, FilesModule],
})
export class AppModule {}
