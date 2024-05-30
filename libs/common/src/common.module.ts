import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'user'),
        password: configService.get<string>('POSTGRES_PASSWORD', ''),
        database: configService.get<string>('POSTGRES_DB', ''),
        autoLoadEntities:
          configService.get<string>('NODE_ENV', 'development') ===
          'development',
        ssl: configService.get<string>('POSTGRES_SSL', 'false') === 'true',
        synchronize:
          configService.get<string>('RUN_MIGRATIONS', 'false') === 'true',
        logging:
          configService.get<string>('NODE_ENV', 'development') ===
          'development',
        entities: [__dirname + '**/*.entity.ts'],
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAILER_HOST'),
          service: config.get<string>('MAILER_SERVICE'),
          port: config.get<number>('MAILER_PORT'),
          secure: true,
          requireTLS: true,
          auth: {
            user: config.get<string>('MAILER_USERNAME'),
            pass: config.get<string>('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@gmail.com>',
        },
        template: {
          adapter: new EjsAdapter(),
          dir: './views',
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
})
export class CommonModule {}
