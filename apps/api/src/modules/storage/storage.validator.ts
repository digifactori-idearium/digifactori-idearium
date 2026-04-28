/**
 * @file storage.validator.ts
 *
 * Validates S3-compatible storage credentials by performing a real
 * HeadBucket call against the configured provider.
 *
 */

import {
  S3Client,
  HeadBucketCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { type StorageProvider } from '@prisma/client';

export interface StorageCredentials {
  provider: StorageProvider;
  region?: string | null;
  endpoint?: string | null;
  bucket?: string | null;
  accessKey?: string | null;
  secretKey?: string | null;
  publicUrl?: string | null;
}

export type StorageValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Validates S3-compatible credentials (S3, R2, GCS interop, MinIO).
 * Uses HeadBucket — succeeds on 200/301/403 (403 = key valid but no ListBucket
 * permission).
 * Fails only on 404 (wrong bucket) or network error.
 */
async function validateS3Compatible(
  creds: StorageCredentials
): Promise<StorageValidationResult> {
  if (!creds.accessKey || !creds.secretKey) {
    return { valid: false, reason: 'accessKey et secretKey sont requis' };
  }
  if (!creds.bucket) {
    return { valid: false, reason: 'Le nom du bucket est requis' };
  }

  const client = new S3Client({
    region: creds.region ?? 'auto',
    ...(creds.endpoint ? { endpoint: creds.endpoint } : {}),
    credentials: {
      accessKeyId: creds.accessKey,
      secretAccessKey: creds.secretKey,
    },
    forcePathStyle: creds.provider === 'MINIO',
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: creds.bucket }));
    return { valid: true };
  } catch (err) {
    if (err instanceof S3ServiceException) {
      // 403 = authenticated but no s3:ListBucket — credentials are valid.
      if (err.$metadata.httpStatusCode === 403) return { valid: true };
      // 301 = bucket exists in different region — credentials are valid.
      if (err.$metadata.httpStatusCode === 301) return { valid: true };
      // 404 = bucket doesn't exist.
      if (err.$metadata.httpStatusCode === 404) {
        return { valid: false, reason: `Bucket "${creds.bucket}" introuvable` };
      }
      // 400/401 = bad credentials.
      return {
        valid: false,
        reason: `Credentials invalides (${err.$metadata.httpStatusCode}: ${err.name})`,
      };
    }
    // Network / DNS error.
    return {
      valid: false,
      reason: `Impossible de joindre le provider: ${(err as Error).message}`,
    };
  }
}

/**
 * Validates Azure Blob Storage credentials.
 * accountName = accessKey field, accountKey = secretKey field.
 */
async function validateAzure(
  creds: StorageCredentials
): Promise<StorageValidationResult> {
  if (!creds.accessKey || !creds.secretKey) {
    return {
      valid: false,
      reason:
        'Pour Azure: accessKey = nom du compte, secretKey = clé du compte',
    };
  }
  if (!creds.bucket) {
    return {
      valid: false,
      reason: 'Pour Azure: bucket = nom du conteneur',
    };
  }

  try {
    const sharedKey = new StorageSharedKeyCredential(
      creds.accessKey,
      creds.secretKey
    );
    const serviceUrl =
      creds.endpoint ?? `https://${creds.accessKey}.blob.core.windows.net`;

    const serviceClient = new BlobServiceClient(serviceUrl, sharedKey);
    const containerClient = serviceClient.getContainerClient(creds.bucket);
    const exists = await containerClient.exists();

    if (!exists) {
      return {
        valid: false,
        reason: `Conteneur Azure "${creds.bucket}" introuvable`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      reason: `Erreur Azure: ${(err as Error).message}`,
    };
  }
}

/**
 * Validate storage credentials for any supported provider.
 *
 * @example
 *   const result = await validateStorageCredentials({
 *     provider: 'R2',
 *     endpoint: 'https://<id>.r2.cloudflarestorage.com',
 *     bucket: 'my-bucket',
 *     accessKey: '...',
 *     secretKey: '...',
 *     publicUrl: 'https://assets.example.com',
 *   });
 *   if (!result.valid) throw new Error(result.reason);
 */
export async function validateStorageCredentials(
  creds: StorageCredentials
): Promise<StorageValidationResult> {
  switch (creds.provider) {
    case 'S3':
    case 'R2':
    case 'GCS':
    case 'MINIO':
      return validateS3Compatible(creds);

    case 'AZURE':
      return validateAzure(creds);

    case 'LOCAL':
      // LOCAL needs no credentials — always valid.
      return { valid: true };

    default:
      return { valid: false, reason: 'Provider non supporté' };
  }
}
