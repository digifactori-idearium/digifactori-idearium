import { AzureAdapter } from './adapters/azure.adapter';
import { LocalAdapter } from './adapters/local.adapter';
import { S3Adapter } from './adapters/s3.adapter';
import { type StorageAdapter } from './adapters/storage.adapter';

import { prisma } from '@/config/client.config';

/**
 * Reads the CloudStorage returns the correct adapter.
 * Called on every upload/delete — config changes via the API take effect
 * immediately without a server restart.
 *
 * Falls back to LocalAdapter when:
 *   - No CloudStorage row exists.
 *   - Provider is LOCAL.
 *   - Required credentials for the configured provider are missing.
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

  if (!accessKey || !secretKey || !bucket || !publicUrl) {
    console.warn(
      `[storage] Provider "${provider}" is configured but credentials are incomplete. Falling back to LOCAL.`
    );
    return new LocalAdapter();
  }

  // Azure SDK.
  if (provider === 'AZURE') {
    return new AzureAdapter({
      accountName: accessKey,
      accountKey: secretKey,
      container: bucket,
      endpoint: endpoint ?? `https://${accessKey}.blob.core.windows.net`,
      publicUrl,
    });
  }

  // S3, R2, GCS (interop), MinIO — all S3-compatible.
  const endpointMap: Partial<Record<typeof provider, string | null>> = {
    S3: null, // Real AWS — no custom endpoint.
    R2: endpoint, // Required: https://<account>.r2.cloudflarestorage.com
    GCS: endpoint ?? 'https://storage.googleapis.com',
    MINIO: endpoint, // Required: http(s)://your-minio-host
  };

  return new S3Adapter({
    region: region ?? 'auto',
    endpoint: endpointMap[provider] ?? undefined,
    accessKey,
    secretKey,
    bucket,
    publicUrl,
    forcePathStyle: provider === 'MINIO',
  });
}
