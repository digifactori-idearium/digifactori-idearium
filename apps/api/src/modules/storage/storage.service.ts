import { StorageProvider } from '@prisma/client';

import { prisma } from '@/config/client.config';

const storageTable = prisma.cloudStorage;

export default class StorageService {
  /**
   * Return the storage configuration singleton (id = 1).
   * Creates a LOCAL row linked to Setting if none exists.
   */
  async getStorage() {
    try {
      const storage = await storageTable.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          provider: 'LOCAL',
          settingId: 1,
        },
        update: {},
      });

      return storage;
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la récupération du storage: ${error.message}`
      );
    }
  }

  /**
   * Update storage configuration.
   * Creates the singleton row if it doesn't exist yet.
   */
  async updateStorage(data: {
    name?: string;
    provider?: StorageProvider;
    region?: string;
    endpoint?: string;
    bucket?: string;
    accessKey?: string;
    secretKey?: string;
    publicUrl?: string;
  }) {
    try {
      const storage = await storageTable.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          settingId: 1,
          provider: data.provider ?? 'LOCAL',
          name: data.name ?? null,
          region: data.region ?? null,
          endpoint: data.endpoint ?? null,
          bucket: data.bucket ?? null,
          accessKey: data.accessKey ?? null,
          secretKey: data.secretKey ?? null,
          publicUrl: data.publicUrl ?? null,
        },
        update: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.provider !== undefined && { provider: data.provider }),
          ...(data.region !== undefined && { region: data.region }),
          ...(data.endpoint !== undefined && { endpoint: data.endpoint }),
          ...(data.bucket !== undefined && { bucket: data.bucket }),
          ...(data.accessKey !== undefined && { accessKey: data.accessKey }),
          ...(data.secretKey !== undefined && { secretKey: data.secretKey }),
          ...(data.publicUrl !== undefined && { publicUrl: data.publicUrl }),
        },
      });

      return storage;
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la mise à jour du storage: ${error.message}`
      );
    }
  }

  /**
   * Reset storage to LOCAL (removes all credentials).
   * Used when the user wants to disable remote storage.
   */
  async resetStorage() {
    try {
      const storage = await storageTable.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          settingId: 1,
          provider: 'LOCAL',
        },
        update: {
          provider: 'LOCAL',
          name: null,
          region: null,
          endpoint: null,
          bucket: null,
          accessKey: null,
          secretKey: null,
          publicUrl: null,
        },
      });

      return storage;
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la réinitialisation du storage: ${error.message}`
      );
    }
  }
}
