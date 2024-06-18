import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import {
  HttpExceptionsFilter,
  ValidationErrorHandler,
  JwtExceptionsFilter,
} from '@app/common';
import {
  DefaultFileSaver,
  FormdataInterceptor,
} from 'nestjs-formdata-interceptor';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { User } from './users/entities/user.entity';

(async () => {
  const routePrefix: string = 'api/v1';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const logger: Logger = new Logger('NestApplication');

  const port: number = configService.get<number>('PORT', 3000);

  app.use(helmet());

  app.enableCors();

  app.useGlobalInterceptors(
    new FormdataInterceptor({
      customFileName(context, originalFileName) {
        return Date.now() + '-' + originalFileName;
      },
      fileSaver: new DefaultFileSaver({
        prefixDirectory: 'media',
        customDirectory(context, originalDirectory) {
          const request = context.switchToHttp().getRequest();
          const user = request.user as User;
          return originalDirectory + '/' + user.id;
        },
      }),
    }),
  );

  app.useGlobalPipes(new ValidationErrorHandler());

  app.useGlobalFilters(new HttpExceptionsFilter(), new JwtExceptionsFilter());

  app.setGlobalPrefix(routePrefix);

  const options = new DocumentBuilder()
    .setTitle('Api Documentation')
    .setDescription('API File Browser Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${routePrefix}/docs`, app, document);

  await app.listen(port, () =>
    logger.log(`Nest application run on port ${port}`),
  );
})();
