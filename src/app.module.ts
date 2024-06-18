import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CommonModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { AccessControllModule } from './access-controll/access-controll.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UsersModule,
    FilesModule,
    AccessControllModule,
  ],
})
export class AppModule {}
