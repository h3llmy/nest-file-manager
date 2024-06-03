import path from 'path';
import { FileData, IFileSaver } from '@app/formdata';
import fs from 'fs';

export class DefaultFileSaver implements IFileSaver {
  save(fileData: FileData): void {
    const directory = path.dirname(fileData.filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(fileData.filePath, fileData.buffer);
  }
}
