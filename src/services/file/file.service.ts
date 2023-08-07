import fs from 'node:fs';
import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { ApiError } from '@/exceptions';

@Injectable()
export class FileService {
  private imgAllowType = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  savePostImage<T extends Express.Multer.File>(file: T | T[]) {
    if (!file) return null;
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'static',
      'images',
      'posts',
    );

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    if (!(file instanceof Array)) {
      if (!this.imgAllowType.includes(file.mimetype)) {
        return ApiError.BadRequest('File type');
      }

      const nameImg = `${v4()}.jpg`;

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      fs.writeFileSync(path.join(filePath, nameImg), file.buffer);

      return [nameImg];
    }
    if (file instanceof Array) {
      const namesImgs: string[] = [];

      file.forEach((picture) => {
        const nameImg = `${v4()}.jpg`;
        namesImgs.push(nameImg);
        fs.writeFileSync(path.join(filePath, nameImg), picture.buffer);
      });

      return namesImgs;
    }

    return null;
  }

  saveAvatar<T extends Express.Multer.File>(file?: T | T[]) {
    const nameImg = `${v4()}.jpg`;
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'static',
      'images',
      'avatars',
    );

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    if (file && !(file instanceof Array)) {
      if (!this.imgAllowType.includes(file.mimetype)) {
        return ApiError.BadRequest('File type');
      }
      fs.writeFileSync(path.join(filePath, nameImg), file.buffer);

      return nameImg;
    }

    return null;
  }
}
