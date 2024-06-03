import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import Busboy from 'busboy';
import { Request } from 'express';
import path from 'path';
import {
  DefaultFileSaver,
  FileData,
  IFileOptions,
  IFileSaver,
  MimeType,
} from '@app/formdata';

/**
 * Interceptor to handle file uploads using Busboy.
 */
@Injectable()
// TODO: change the prefixDirectory to fileSaver
export class FormdataInterceptor implements NestInterceptor {
  private readonly arrayRegexPattern: RegExp = /\[\]$/;
  private readonly nestedRegexPattern: RegExp = /[\[\]]/;

  constructor(private readonly fileOptions?: IFileOptions) {}

  /**
   * Intercepts the request to handle file uploads if the content type is multipart/form-data.
   * @param context - The execution context.
   * @param next - The next call handler.
   * @returns An Observable that processes the file upload.
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const {
      prefixDirectory,
      customFileName,
      customDirectory,
      fileSaver = new DefaultFileSaver(),
    } = this.fileOptions || {};
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const contentType = request.headers['content-type'];

    if (
      contentType &&
      contentType.includes('multipart/form-data') &&
      prefixDirectory
    ) {
      return this.handleMultipartFormData(
        context,
        next,
        request,
        prefixDirectory,
        customFileName,
        customDirectory,
        fileSaver,
      );
    }

    return next.handle();
  }

  /**
   * Handles multipart/form-data file uploads.
   * @param context - The execution context.
   * @param next - The next call handler.
   * @param request - The HTTP request.
   * @param prefixDirectory - The directory to save uploaded files.
   * @param customFileName - Optional function to customize file names.
   * @param customDirectory - Optional function to customize directories.
   * @returns An Observable that processes the file upload.
   */
  private async handleMultipartFormData(
    context: ExecutionContext,
    next: CallHandler,
    request: Request,
    prefixDirectory: string,
    customFileName?: (
      context: ExecutionContext,
      originalFileName: string,
    ) => Promise<string> | string,
    customDirectory?: (
      context: ExecutionContext,
      originalDirectory: string,
    ) => Promise<string> | string,
    fileSaver?: IFileSaver,
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
          const fileExtension = filename.filename.split('.').pop();
          const fileNameOnly = filename.filename
            .split('.')
            .slice(0, -1)
            .join('.');
          const finalFileName = customFileName
            ? await customFileName(context, fileNameOnly)
            : fileNameOnly;
          const fullFileName = `${finalFileName}.${fileExtension}`;

          const directoryPath = customDirectory
            ? await customDirectory(context, prefixDirectory)
            : prefixDirectory;

          const filePath = path
            .join(directoryPath, fullFileName)
            .replace(/\\/g, '/');

          FileData.prototype.save = function (this: FileData) {
            fileSaver.save(this);
          };

          const fileData = new FileData(
            filename.filename,
            finalFileName,
            fullFileName,
            filename.encoding,
            filename.mimeType as MimeType,
            fileExtension,
            fileSize,
            filePath,
            Buffer.concat(fileBuffer),
          );

          this.handleField(files, fieldname, fileData);
        });
      });

      busboy.on('field', (fieldname, val) => {
        this.handleField(fields, fieldname, val);
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

  /**
   * Handles a field by setting its value in the target object, supporting nested fields and arrays.
   * @param target - The target object to set the field value.
   * @param fieldname - The name of the field.
   * @param value - The value to set.
   */
  private handleField(target: any, fieldname: string, value: any) {
    const keys = fieldname.split(this.nestedRegexPattern).filter(Boolean);
    const isArrayField = this.arrayRegexPattern.test(fieldname);
    this.setNestedValue(target, keys, value, isArrayField);
  }

  /**
   * Sets a nested value in an object, supporting nested fields and arrays.
   * @param obj - The object to set the nested value in.
   * @param keys - The keys representing the nested path.
   * @param value - The value to set.
   * @param isArray - Whether the field is an array.
   */
  private setNestedValue(
    obj: any,
    keys: string[],
    value: any,
    isArray = false,
  ) {
    let current = obj;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        if (isArray) {
          if (!Array.isArray(current[key])) {
            current[key] = [];
          }
          current[key].push(value);
        } else {
          if (current[key]) {
            if (Array.isArray(current[key])) {
              current[key].push(value);
            } else {
              current[key] = [current[key], value];
            }
          } else {
            current[key] = value;
          }
        }
      } else {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    });
  }
}