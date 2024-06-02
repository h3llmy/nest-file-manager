import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { FormdataInterceptor, ValidationErrorHandler } from '@app/common';
import { HttpExceptionsFilter } from '@app/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtExceptionsFilter } from '@app/common/errorHandler/JwtErrorHandler';
import { Response } from 'express';

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
      prefixDirectory: 'media',
      customFileName(context, originalFileName) {
        return Date.now() + '-' + originalFileName;
      },
      customDirectory(context, originalDirectory) {
        const request = context.switchToHttp().getRequest();
        return originalDirectory + '/' + request?.user?.id;
      },
    }),
  );

  app.useGlobalPipes(new ValidationErrorHandler());

  app.useGlobalFilters(new HttpExceptionsFilter(), new JwtExceptionsFilter());

  app.setGlobalPrefix(routePrefix);

  app.useStaticAssets(join(__dirname, '..', 'media'), {
    prefix: '/media',
    setHeaders: (res: Response) => {
      res.setHeader('Cross-Origin-Resource-Policy', '*');
    },
  });

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
