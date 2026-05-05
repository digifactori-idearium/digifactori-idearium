import { AzureAdapter } from './adapters/azure.adapter';
import { LocalAdapter } from './adapters/local.adapter';
import { S3Adapter } from './adapters/s3.adapter';
import { type StorageAdapter } from './adapters/storage.adapter';

import { prisma } from '@/config/client.config';

/**
 * Reads the CloudStorage row (id = 1) and returns the correct adapter.
 * Called on every upload/delete so config changes take effect immediately.
 *
 * Falls back to LocalAdapter when:
 *   - No CloudStorage row exists.
 *   - Provider is LOCAL.
 *   - Required credentials (accessKey, secretKey, bucket) are missing.
 *
 * publicUrl is optional
 */
export async function resolveStorageAdapter(): Promise<StorageAdapter> {
  const storage = await prisma.cloudStorage
    .findUnique({ where: { id: 1 } })
    .catch(() => null);

  if (!storage || storage.provider === 'LOCAL') {
    return new LocalAdapter();
  }

  const {
    provider,
    region,
    endpoint,
    bucket,
    accessKey,
    secretKey,
    publicUrl,
  } = storage;

  if (!accessKey || !secretKey || !bucket) {
    console.warn(
      `[storage] Provider "${provider}" is configured but credentials are incomplete ` +
        `(need accessKey, secretKey, bucket). Falling back to LOCAL.`
    );
    return new LocalAdapter();
  }

  const resolvedPublicUrl = publicUrl?.trim() || '';

  if (!resolvedPublicUrl) {
    console.warn(
      `[storage] Could not derive a publicUrl for provider "${provider}". ` +
        `Set publicUrl explicitly or provide an endpoint. Falling back to LOCAL.`
    );
    return new LocalAdapter();
  }

  // Azure has its own SDK.
  if (provider === 'AZURE') {
    return new AzureAdapter({
      accountName: accessKey,
      accountKey: secretKey,
      container: bucket,
      endpoint: endpoint ?? `https://${accessKey}.blob.core.windows.net`,
      publicUrl: resolvedPublicUrl,
    });
  }

  // S3, R2, GCS (interop), MinIO — all S3-compatible.
  return new S3Adapter({
    region: region ?? 'auto',
    endpoint: endpoint ?? undefined,
    accessKey,
    secretKey,
    bucket,
    publicUrl: resolvedPublicUrl,
    forcePathStyle: provider === 'MINIO',
  });
}
