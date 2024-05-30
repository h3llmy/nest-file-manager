import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ValidationErrorHandler } from '@app/common';
import { HttpExceptionsFilter } from '@app/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtExceptionsFilter } from '@app/common/errorHandler/JwtErrorHandler';
import expressFileUpload, { UploadedFile } from 'express-fileupload';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { User } from './users/entities/user.entity';

(async () => {
  const routePrefix: string = 'api/v1';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const logger: Logger = new Logger('NestApplication');

  const port: number = configService.get<number>('PORT', 3000);

  app.use(helmet());
  app.use(
    expressFileUpload({
      useTempFiles: true,
      tempFileDir: '/tmp/',
    }),
    (req: Request, res: Response, next: NextFunction) => {
      res.on('finish', () => {
        if (
          Object.keys(req.files).length > 0 &&
          res.statusCode >= 200 &&
          res.statusCode < 400
        ) {
          let filePath: string = `media/${(req.user as User)?.id}`;
          Object.keys(req.files).forEach((fileKey) => {
            const uploadedFiles = Array.isArray(req.files[fileKey])
              ? (req.files[fileKey] as UploadedFile[])
              : [req.files[fileKey] as UploadedFile];

            uploadedFiles.forEach((file: UploadedFile) => {
              if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {
                  recursive: true,
                });
              }

              file.mv(`${filePath}/${file.md5}-${file.name}`);
            });
          });
        }
      });
      next();
    },
  );

  app.enableCors();

  app.useGlobalPipes(new ValidationErrorHandler());
  app.useGlobalFilters(new HttpExceptionsFilter());
  app.useGlobalFilters(new JwtExceptionsFilter());

  app.setGlobalPrefix(routePrefix);

  app.useStaticAssets(join(__dirname, '..', 'media'), {
    prefix: '/media',
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
