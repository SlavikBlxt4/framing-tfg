import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

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

  getPublicBaseUrl(fullKey: string): string {
    const parts = fullKey.split('/');
    const prefix = parts.slice(0, parts.length - 1).join('/') + '/';
    return `https://${process.env.AWS_S3_BUCKET_PHOTOGRAPHERS}.s3.${process.env.AWS_REGION}.amazonaws.com/${prefix}`;
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

  async listPublicUrlsInPrefix(prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_PHOTOGRAPHERS,
      Prefix: prefix,
    });

    const response = await this.s3.send(command);

    return (
      response.Contents?.map(obj =>
        `https://${process.env.AWS_S3_BUCKET_PHOTOGRAPHERS}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(obj.Key)}`
      ) ?? []
    );

  }
}
