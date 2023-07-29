import { Injectable } from '@nestjs/common';
import fileUpload from 'express-fileupload';
import path from 'path';
import { v4 } from 'uuid';

import { ApiError } from '@/exceptions';

@Injectable()
export class FileService {
  private imgAllowType = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  savePostImage<T extends fileUpload.UploadedFile>(file: T | T[]) {
    if (!file) return null;
    if (!(file instanceof Array)) {
      if (!this.imgAllowType.includes(file.mimetype)) {
        return ApiError.BadRequest('File type');
      }

      const nameImg = `${v4()}.jpg`;

      file.mv(path.resolve(__dirname, '@/ ', 'images', 'posts', nameImg));

      return [nameImg];
    }
    if (file instanceof Array) {
      const namesImgs: string[] = [];

      file.forEach((picture) => {
        const nameImg = `${v4()}.jpg`;
        namesImgs.push(nameImg);
        picture.mv(path.resolve(__dirname, '@/ ', 'images', 'posts', nameImg));
      });

      return namesImgs;
    }

    return null;
  }

  saveAvatar<T extends fileUpload.UploadedFile>(file?: T | T[]) {
    const nameImg = `${v4()}.jpg`;

    if (file && !(file instanceof Array)) {
      if (!this.imgAllowType.includes(file.mimetype)) {
        return ApiError.BadRequest('File type');
      }
      file.mv(path.resolve(__dirname, '@/ ', 'images', 'avatars', nameImg));

      return nameImg;
    }

    return null;
  }
}
