import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import Busboy from 'busboy';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';

export interface IFileOptions {
  autoSave?: boolean;
  prefixDirectory?: string;
  customFileName?: (
    context: ExecutionContext,
    originalFileName: string,
  ) => Promise<string> | string;
  customDirectory?: (
    context: ExecutionContext,
    originalDirectory: string,
  ) => Promise<string> | string;
}

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private readonly fileOptions?: IFileOptions) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const { autoSave, prefixDirectory, customFileName, customDirectory } =
      this.fileOptions || {};
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const contentType = request.headers['content-type'];

    if (
      contentType &&
      contentType.includes('multipart/form-data') &&
      autoSave &&
      prefixDirectory
    ) {
      return this.handleMultipartFormData(
        context,
        next,
        request,
        autoSave,
        prefixDirectory,
        customFileName,
        customDirectory,
      );
    }

    return next.handle();
  }

  private async handleMultipartFormData(
    context: ExecutionContext,
    next: CallHandler,
    request: Request,
    autoSave: boolean,
    prefixDirectory: string,
    customFileName?: (
      context: ExecutionContext,
      originalFileName: string,
    ) => Promise<string> | string,
    customDirectory?: (
      context: ExecutionContext,
      originalDirectory: string,
    ) => Promise<string> | string,
  ): Promise<Observable<any>> {
    return new Observable((observer) => {
      const busboy = Busboy({ headers: request.headers });
      const files = {};
      const fields = {};

      busboy.on('file', async (fieldname, file, filename) => {
        const fileBuffer = [];
        let fileSize = 0;

        file.on('data', (data) => {
          fileBuffer.push(data);
          fileSize += data.length;
        });

        file.on('end', async () => {
          const fileExtention = filename.filename.split('.').pop();
          const fileNameOnly = filename.filename
            .split('.')
            .slice(0, -1)
            .join('.');
          const finalFileName = customFileName
            ? await customFileName(context, fileNameOnly)
            : fileNameOnly;

          filename.filename = `${finalFileName}.${fileExtention}`;

          const fileData = {
            fileName: fileNameOnly,
            fileNameFull: filename.filename,
            encoding: filename.encoding,
            mimetype: filename.mimeType,
            fileExtention,
            fileSize,
            filePath: '',
            buffer: Buffer.concat(fileBuffer),
          };

          if (customDirectory) {
            const directoryFile = await customDirectory(
              context,
              prefixDirectory,
            );
            const filePath = path.join(directoryFile, filename.filename);
            const directoryPath = path.dirname(filePath);

            if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
            }

            fs.writeFileSync(filePath, fileData.buffer);
            fileData.filePath = filePath;
          }

          // Determine the field name without '[]'
          const fieldName = fieldname.endsWith('[]')
            ? fieldname.slice(0, -2)
            : fieldname;

          // Ensure the field is treated as an array if '[]' is present
          if (fieldname.endsWith('[]')) {
            if (!Array.isArray(files[fieldName])) {
              files[fieldName] = [];
            }
            files[fieldName].push(fileData);
          } else {
            // Treat as single object if '[]' is not present
            files[fieldName] = fileData;
          }
        });
      });

      busboy.on('field', (fieldname, val) => {
        // Ensure the field is treated as an array if '[]' is present
        if (fieldname.endsWith('[]')) {
          const fieldName = fieldname.slice(0, -2); // Remove '[]' from field name
          if (!Array.isArray(fields[fieldName])) {
            fields[fieldName] = [];
          }
          fields[fieldName].push(val);
        } else {
          // Treat as single object if '[]' is not present
          fields[fieldname] = val;
        }
      });

      busboy.on('finish', () => {
        request['body'] = { ...fields, ...files };
        next.handle().subscribe({
          next: (val) => observer.next(val),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });

      request.pipe(busboy);
    });
  }
}
