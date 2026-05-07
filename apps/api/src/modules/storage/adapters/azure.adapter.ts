import {
  BlobServiceClient,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';

import { buildKey } from './local.adapter';
import { type StorageAdapter, type UploadedFile } from './storage.adapter';

export interface AzureAdapterConfig {
  accountName: string; // maps to accessKey in CloudStorage
  accountKey: string; // maps to secretKey in CloudStorage
  container: string; // maps to bucket in CloudStorage
  endpoint: string; // https://<account>.blob.core.windows.net
  publicUrl: string; // CDN prefix or same as endpoint
}

export class AzureAdapter implements StorageAdapter {
  private readonly client: BlobServiceClient;
  private readonly credential: StorageSharedKeyCredential;

  constructor(private readonly config: AzureAdapterConfig) {
    this.credential = new StorageSharedKeyCredential(
      config.accountName,
      config.accountKey
    );
    this.client = new BlobServiceClient(config.endpoint, this.credential);
  }

  async upload(
    file: UploadedFile,
    uploadDir?: string | null,
    fileId?: string | number | null
  ): Promise<string> {
    const key = buildKey(file.originalname, uploadDir, fileId);

    const containerClient = this.client.getContainerClient(
      this.config.container
    );
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      const containerClient = this.client.getContainerClient(
        this.config.container
      );
      await containerClient.getBlockBlobClient(key).deleteIfExists();
    } catch {
      // ignore.
    }
  }

  getPublicUrl(key: string): string {
    if (!this.config.publicUrl) return '';
    return `${this.config.publicUrl.replace(/\/$/, '')}/${key}`;
  }

  /**
   * Generates an Azure Blob SAS URL valid for `expiresIn` seconds.
   * The browser fetches the file directly from Azure — no backend proxy.
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + expiresIn * 1000);

    const sasQuery = generateBlobSASQueryParameters(
      {
        containerName: this.config.container,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        startsOn,
        expiresOn,
      },
      this.credential
    ).toString();

    const blobUrl = this.client
      .getContainerClient(this.config.container)
      .getBlockBlobClient(key).url;

    return `${blobUrl}?${sasQuery}`;
  }
}
