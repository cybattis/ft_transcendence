import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error: UploadApiErrorResponse, result: UploadApiResponse) => {
        if (error) return reject(error);
        if (result) resolve(result);
      });
    
      toStream(file.buffer).pipe(upload);
    });
  }
}