import fs from 'fs';
import path from 'path';

import { type StorageAdapter, type UploadedFile } from './storage.adapter';

const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DEV_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

export class LocalAdapter implements StorageAdapter {
  async upload(
    file: UploadedFile,
    uploadDir?: string | null,
    fileId?: string | number | null
  ): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'LocalAdapter cannot be used in production. Configure an S3-compatible storage provider.'
      );
    }

    const key = buildKey(file.originalname, uploadDir, fileId);
    const dest = path.join(LOCAL_UPLOADS_DIR, key);

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, file.buffer);

    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      const abs = path.join(LOCAL_UPLOADS_DIR, key);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch {
      //ignored
    }
  }

  getPublicUrl(key: string): string {
    return `${DEV_BASE_URL}/uploads/${key}`;
  }
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export function buildKey(
  originalname: string,
  uploadDir?: string | null,
  fileId?: string | number | null
): string {
  const ext = path.extname(originalname);
  const base = path.basename(originalname, ext);
  const filename = fileId
    ? `${fileId}${ext}`
    : `${Date.now()}-${sanitizeFilename(base)}${ext}`;

  const safeDir = uploadDir?.replace(/[^a-zA-Z0-9/_-]/g, '');
  return safeDir ? `${safeDir}/${filename}` : filename;
}
