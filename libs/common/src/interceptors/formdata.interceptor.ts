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

export enum MimeType {
  'application/andrew-inset' = 'application/andrew-inset',
  'application/applixware' = 'application/applixware',
  'application/atom+xml' = 'application/atom+xml',
  'application/atomcat+xml' = 'application/atomcat+xml',
  'application/atomsvc+xml' = 'application/atomsvc+xml',
  'application/ccxml+xml' = 'application/ccxml+xml',
  'application/cdmi-capability' = 'application/cdmi-capability',
  'application/cdmi-container' = 'application/cdmi-container',
  'application/cdmi-domain' = 'application/cdmi-domain',
  'application/cdmi-object' = 'application/cdmi-object',
  'application/cdmi-queue' = 'application/cdmi-queue',
  'application/cu-seeme' = 'application/cu-seeme',
  'application/dash+xml' = 'application/dash+xml',
  'application/davmount+xml' = 'application/davmount+xml',
  'application/docbook+xml' = 'application/docbook+xml',
  'application/dssc+der' = 'application/dssc+der',
  'application/dssc+xml' = 'application/dssc+xml',
  'application/ecmascript' = 'application/ecmascript',
  'application/emma+xml' = 'application/emma+xml',
  'application/epub+zip' = 'application/epub+zip',
  'application/exi' = 'application/exi',
  'application/font-tdpfr' = 'application/font-tdpfr',
  'application/gml+xml' = 'application/gml+xml',
  'application/gpx+xml' = 'application/gpx+xml',
  'application/gxf' = 'application/gxf',
  'application/hyperstudio' = 'application/hyperstudio',
  'application/inkml+xml' = 'application/inkml+xml',
  'application/ipfix' = 'application/ipfix',
  'application/java-archive' = 'application/java-archive',
  'application/java-serialized-object' = 'application/java-serialized-object',
  'application/java-vm' = 'application/java-vm',
  'application/javascript' = 'application/javascript',
  'application/json' = 'application/json',
  'application/jsonml+json' = 'application/jsonml+json',
  'application/lost+xml' = 'application/lost+xml',
  'application/mac-binhex40' = 'application/mac-binhex40',
  'application/mac-compactpro' = 'application/mac-compactpro',
  'application/mads+xml' = 'application/mads+xml',
  'application/marc' = 'application/marc',
  'application/marcxml+xml' = 'application/marcxml+xml',
  'application/mathematica' = 'application/mathematica',
  'application/mathml+xml' = 'application/mathml+xml',
  'application/mbox' = 'application/mbox',
  'application/mediaservercontrol+xml' = 'application/mediaservercontrol+xml',
  'application/metalink+xml' = 'application/metalink+xml',
  'application/metalink4+xml' = 'application/metalink4+xml',
  'application/mets+xml' = 'application/mets+xml',
  'application/mods+xml' = 'application/mods+xml',
  'application/mp21' = 'application/mp21',
  'application/mp4' = 'application/mp4',
  'application/msword' = 'application/msword',
  'application/mxf' = 'application/mxf',
  'application/octet-stream' = 'application/octet-stream',
  'application/oda' = 'application/oda',
  'application/oebps-package+xml' = 'application/oebps-package+xml',
  'application/ogg' = 'application/ogg',
  'application/omdoc+xml' = 'application/omdoc+xml',
  'application/onenote' = 'application/onenote',
  'application/oxps' = 'application/oxps',
  'application/patch-ops-error+xml' = 'application/patch-ops-error+xml',
  'application/pdf' = 'application/pdf',
  'application/pgp-encrypted' = 'application/pgp-encrypted',
  'application/pgp-signature' = 'application/pgp-signature',
  'application/pics-rules' = 'application/pics-rules',
  'application/pkcs10' = 'application/pkcs10',
  'application/pkcs7-mime' = 'application/pkcs7-mime',
  'application/pkcs7-signature' = 'application/pkcs7-signature',
  'application/pkcs8' = 'application/pkcs8',
  'application/pkix-attr-cert' = 'application/pkix-attr-cert',
  'application/pkix-cert' = 'application/pkix-cert',
  'application/pkix-crl' = 'application/pkix-crl',
  'application/pkix-pkipath' = 'application/pkix-pkipath',
  'application/pls+xml' = 'application/pls+xml',
  'application/postscript' = 'application/postscript',
  'application/prs.cww' = 'application/prs.cww',
  'application/pskc+xml' = 'application/pskc+xml',
  'application/rdf+xml' = 'application/rdf+xml',
  'application/reginfo+xml' = 'application/reginfo+xml',
  'application/relax-ng-compact-syntax' = 'application/relax-ng-compact-syntax',
  'application/resource-lists+xml' = 'application/resource-lists+xml',
  'application/resource-lists-diff+xml' = 'application/resource-lists-diff+xml',
  'application/rls-services+xml' = 'application/rls-services+xml',
  'application/rss+xml' = 'application/rss+xml',
  'application/rtf' = 'application/rtf',
  'application/sbml+xml' = 'application/sbml+xml',
  'application/scvp-cv-request' = 'application/scvp-cv-request',
  'application/scvp-cv-response' = 'application/scvp-cv-response',
  'application/scvp-vp-request' = 'application/scvp-vp-request',
  'application/scvp-vp-response' = 'application/scvp-vp-response',
  'application/sdp' = 'application/sdp',
  'application/set-payment-initiation' = 'application/set-payment-initiation',
  'application/set-registration-initiation' = 'application/set-registration-initiation',
  'application/shf+xml' = 'application/shf+xml',
  'application/smil+xml' = 'application/smil+xml',
  'application/sparql-query' = 'application/sparql-query',
  'application/sparql-results+xml' = 'application/sparql-results+xml',
  'application/srgs' = 'application/srgs',
  'application/srgs+xml' = 'application/srgs+xml',
  'application/sru+xml' = 'application/sru+xml',
  'application/ssml+xml' = 'application/ssml+xml',
  'application/tei+xml' = 'application/tei+xml',
  'application/thraud+xml' = 'application/thraud+xml',
  'application/timestamped-data' = 'application/timestamped-data',
  'application/vnd.3gpp.pic-bw-large' = 'application/vnd.3gpp.pic-bw-large',
  'application/vnd.3gpp.pic-bw-small' = 'application/vnd.3gpp.pic-bw-small',
  'application/vnd.3gpp.pic-bw-var' = 'application/vnd.3gpp.pic-bw-var',
  'application/vnd.3gpp2.tcap' = 'application/vnd.3gpp2.tcap',
  'application/vnd.3m.post-it-notes' = 'application/vnd.3m.post-it-notes',
  'application/vnd.accpac.simply.aso' = 'application/vnd.accpac.simply.aso',
  'application/vnd.accpac.simply.imp' = 'application/vnd.accpac.simply.imp',
  'application/vnd.acucobol' = 'application/vnd.acucobol',
  'application/vnd.acucorp' = 'application/vnd.acucorp',
  'application/vnd.adobe.air-application-installer-package+zip' = 'application/vnd.adobe.air-application-installer-package+zip',
  'application/vnd.adobe.formscentral.fcdt' = 'application/vnd.adobe.formscentral.fcdt',
  'application/vnd.adobe.fxp' = 'application/vnd.adobe.fxp',
  'application/vnd.adobe.xdp+xml' = 'application/vnd.adobe.xdp+xml',
  'application/vnd.adobe.xfdf' = 'application/vnd.adobe.xfdf',
  'application/vnd.ahead.space' = 'application/vnd.ahead.space',
  'application/vnd.airzip.filesecure.azf' = 'application/vnd.airzip.filesecure.azf',
  'application/vnd.airzip.filesecure.azs' = 'application/vnd.airzip.filesecure.azs',
  'application/vnd.amazon.ebook' = 'application/vnd.amazon.ebook',
  'application/vnd.americandynamics.acc' = 'application/vnd.americandynamics.acc',
  'application/vnd.amiga.ami' = 'application/vnd.amiga.ami',
  'application/vnd.android.package-archive' = 'application/vnd.android.package-archive',
  'application/vnd.anser-web-certificate-issue-initiation' = 'application/vnd.anser-web-certificate-issue-initiation',
  'application/vnd.anser-web-funds-transfer-initiation' = 'application/vnd.anser-web-funds-transfer-initiation',
  'application/vnd.antix.game-component' = 'application/vnd.antix.game-component',
  'application/vnd.apple.installer+xml' = 'application/vnd.apple.installer+xml',
  'application/vnd.apple.mpegurl' = 'application/vnd.apple.mpegurl',
  'application/vnd.aristanetworks.swi' = 'application/vnd.aristanetworks.swi',
  'application/vnd.astraea-software.iota' = 'application/vnd.astraea-software.iota',
  'application/vnd.audiograph' = 'application/vnd.audiograph',
  'application/vnd.blueice.multipass' = 'application/vnd.blueice.multipass',
  'application/vnd.bmi' = 'application/vnd.bmi',
  'application/vnd.businessobjects' = 'application/vnd.businessobjects',
  'application/vnd.chemdraw+xml' = 'application/vnd.chemdraw+xml',
  'application/vnd.chipnuts.karaoke-mmd' = 'application/vnd.chipnuts.karaoke-mmd',
  'application/vnd.cinderella' = 'application/vnd.cinderella',
  'application/vnd.claymore' = 'application/vnd.claymore',
  'application/vnd.cloanto.rp9' = 'application/vnd.cloanto.rp9',
  'application/vnd.clonk.c4group' = 'application/vnd.clonk.c4group',
  'application/vnd.cluetrust.cartomobile-config' = 'application/vnd.cluetrust.cartomobile-config',
  'application/vnd.cluetrust.cartomobile-config-pkg' = 'application/vnd.cluetrust.cartomobile-config-pkg',
  'application/vnd.commonspace' = 'application/vnd.commonspace',
  'image/jpeg' = 'image/jpeg',
  'image/png' = 'image/png',
  'image/gif' = 'image/gif',
  'image/bmp' = 'image/bmp',
  'image/webp' = 'image/webp',
  'image/svg+xml' = 'image/svg+xml',
  'video/mp4' = 'video/mp4',
  'video/mpeg' = 'video/mpeg',
  'video/webm' = 'video/webm',
  'video/quicktime' = 'video/quicktime',
  'video/x-msvideo' = 'video/x-msvideo',
  'video/x-ms-wmv' = 'video/x-ms-wmv',
  'audio/mpeg' = 'audio/mpeg',
  'audio/ogg' = 'audio/ogg',
  'audio/wav' = 'audio/wav',
  'audio/webm' = 'audio/webm',
  'audio/midi' = 'audio/midi',
}

/**
 * Represents the data for a file.
 */
export class FileData {
  constructor(
    public fileName: string,
    public fileNameFull: string,
    public encoding: string,
    public mimetype: MimeType,
    public fileExtension: string,
    public fileSize: number,
    public filePath: string,
    public buffer: Buffer,
  ) {}

  /**
   * Saves the file data to the specified file path.
   */
  save() {
    const directory = path.dirname(this.filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(this.filePath, this.buffer);
  }
}

/**
 * Options for customizing file upload behavior.
 */
export interface IFileOptions {
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

/**
 * Interceptor to handle file uploads using Busboy.
 */
@Injectable()
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
    const { prefixDirectory, customFileName, customDirectory } =
      this.fileOptions || {};
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

          const fileData = new FileData(
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
