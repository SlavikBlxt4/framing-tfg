import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  async uploadToPath(key: string, file: Express.Multer.File): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_PHOTOGRAPHERS,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET_PHOTOGRAPHERS}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async uploadUserProfileImage(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    const key = `usuarios/${userId}/foto_perfil_${Date.now()}_${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_USERS,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET_USERS}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
