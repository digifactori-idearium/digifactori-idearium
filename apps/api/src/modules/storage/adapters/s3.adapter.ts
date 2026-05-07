import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { buildKey } from './local.adapter';
import { type StorageAdapter, type UploadedFile } from './storage.adapter';

export interface S3AdapterConfig {
  region: string;
  endpoint?: string; // for R2 / MinIO / GCS
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string; // CDN or bucket URL prefix
  forcePathStyle?: boolean; // True for MinIO
}

export class S3Adapter implements StorageAdapter {
  private readonly client: S3Client;

  constructor(private readonly config: S3AdapterConfig) {
    this.client = new S3Client({
      region: config.region,
      ...(config.endpoint ? { endpoint: config.endpoint } : {}),
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: config.forcePathStyle ?? false,
    });
  }

  async upload(
    file: UploadedFile,
    uploadDir?: string | null,
    fileId?: string | number | null
  ): Promise<string> {
    const key = buildKey(file.originalname, uploadDir, fileId);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
    } catch {
      // ignore
    }
  }

  getPublicUrl(key: string): string {
    if (!this.config.publicUrl) return '';
    return `${this.config.publicUrl.replace(/\/$/, '')}/${key}`;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
