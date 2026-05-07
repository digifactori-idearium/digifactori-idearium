import { Asset } from '@prisma/client';

import { prisma } from '@/config/client.config';
import { resolveStorageAdapter } from '@/modules/storage/storage.factory';
import { IAssetService } from '@/types';
import { uploadFile, deleteFile } from '@/utils/storage.service';

export type AssetWithUrls = Asset & {
  fileUrl: string;
  thumbnailUrl: string | null;
};

const UPLOAD_DIR = 'assets';

const THUMB_DIR = 'assets/thumbnails';

/**
 * Resolve storage keys to public URLs and attach them to an asset record.
 * The DB stores keys ("assets/clxxx.glb"); the client always receives URLs.
 */
async function withPublicUrls<
  T extends { file: string; thumbnail: string | null },
>(asset: T): Promise<T & { fileUrl: string; thumbnailUrl: string | null }> {
  const adapter = await resolveStorageAdapter();
  return {
    ...asset,
    fileUrl: adapter.getPublicUrl(asset.file),
    thumbnailUrl: asset.thumbnail
      ? adapter.getPublicUrl(asset.thumbnail)
      : null,
  };
}

const assetTable = prisma.asset;

export default class AssetService implements IAssetService {
  /**
   * Paginated, filtered list with public URLs of assets.
   */
  async getAssets(filter: ListAssetsFilter) {
    const { category, type, search, tags, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where = {
      ...(category ? { category } : {}),
      ...(type ? { type } : {}),
      ...(search
        ? { name: { contains: search, mode: 'insensitive' as const } }
        : {}),
      ...(tags && tags.length > 0 ? { tags: { hasEvery: tags } } : {}),
    };

    try {
      const [items, total] = await prisma.$transaction([
        assetTable.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        assetTable.count({ where }),
      ]);

      // get the storage adapter
      const adapter = await resolveStorageAdapter();
      const enriched = items.map(asset => ({
        ...asset,
        fileUrl: adapter.getPublicUrl(asset.file),
        thumbnailUrl: asset.thumbnail
          ? adapter.getPublicUrl(asset.thumbnail)
          : null,
      }));

      return {
        items: enriched,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la récupération des assets: ${error.message}`
      );
    }
  }

  /**
   * get single asset by id with resolved public URLs.
   */
  async getAssetById(id: string) {
    try {
      const asset = await assetTable.findUnique({ where: { id } });
      if (!asset) throw new Error('Asset introuvable');
      return withPublicUrls(asset);
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la récupération de l'asset: ${error.message}`
      );
    }
  }

  /**
   * Creates an asset
   *
   * rollback on any failure
   */
  async createAsset(input: CreateAssetInput) {
    // create a placeholder row to get the id
    let id: string;
    try {
      const placeholder = await assetTable.create({
        data: {
          name: input.name,
          category: input.category as any,
          type: input.type as any,
          tags: input.tags ?? [],
          file: '__pending__',
        },
        select: { id: true },
      });
      id = placeholder.id;
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la création du placeholder: ${error.message}`
      );
    }

    let fileKey: string;
    let thumbnailKey: string | undefined;

    // Upload main file, if failure roll back placeholder
    try {
      fileKey = await uploadFile(input.file, UPLOAD_DIR, id);
    } catch (error: any) {
      await assetTable.delete({ where: { id } }).catch(() => {});
      throw new Error(`Erreur lors de l'upload du fichier: ${error.message}`);
    }

    // Upload thumbnail, if failure roll back placeholder and file.
    if (input.thumbnail) {
      try {
        thumbnailKey = await uploadFile(
          input.thumbnail,
          THUMB_DIR,
          `${id}-thumb`
        );
      } catch (error: any) {
        await deleteFile(fileKey);
        await assetTable.delete({ where: { id } }).catch(() => {});
        throw new Error(
          `Erreur lors de l'upload de la miniature: ${error.message}`
        );
      }
    }

    // final row with storage key
    try {
      const asset = await assetTable.update({
        where: { id },
        data: { file: fileKey, thumbnail: thumbnailKey ?? null },
      });
      return withPublicUrls(asset);
    } catch (error: any) {
      await deleteFile(fileKey);
      if (thumbnailKey) await deleteFile(thumbnailKey);
      await assetTable.delete({ where: { id } }).catch(() => {});
      throw new Error(
        `Erreur lors de la finalisation de l'asset: ${error.message}`
      );
    }
  }

  /**
   * Bulk create, it sequential to avoid overloading the storage provider
   *
   * Partial success: returns succeeded[] and failed[] separately
   */
  async bulkCreateAssets(
    descriptors: BulkCreateAssetInput[],
    files: UploadedFile[],
    thumbnails: UploadedFile[]
  ) {
    const results: {
      succeeded: AssetWithUrls[];
      failed: { index: number; name: string; reason: string }[];
    } = { succeeded: [], failed: [] };

    for (let i = 0; i < descriptors.length; i++) {
      const desc = descriptors[i];
      const file = files[desc.fileIndex];
      const thumbnail =
        desc.thumbnailIndex !== undefined
          ? thumbnails[desc.thumbnailIndex]
          : undefined;

      if (!file) {
        results.failed.push({
          index: i,
          name: desc.name,
          reason: `Aucun fichier trouvé à l'index ${desc.fileIndex}`,
        });
        continue;
      }

      try {
        const asset = await this.createAsset({
          name: desc.name,
          category: desc.category,
          type: desc.type,
          tags: desc.tags,
          file,
          thumbnail,
        });
        results.succeeded.push(asset);
      } catch (error: any) {
        results.failed.push({
          index: i,
          name: desc.name,
          reason: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Update asset info and optionally replace file / thumbnail
   *
   * new  uploads rolled back if the DB update fails
   */
  async updateAsset(id: string, input: UpdateAssetInput) {
    const existing = await this.getAssetById(id);

    let fileKey: string | undefined;
    let thumbnailKey: string | undefined;

    if (input.file) {
      try {
        fileKey = await uploadFile(input.file, UPLOAD_DIR, id);
      } catch (error: any) {
        throw new Error(
          `Erreur lors de l'upload du nouveau fichier: ${error.message}`
        );
      }
    }

    if (input.thumbnail) {
      try {
        thumbnailKey = await uploadFile(
          input.thumbnail,
          THUMB_DIR,
          `${id}-thumb`
        );
      } catch (error: any) {
        if (fileKey) await deleteFile(fileKey);
        throw new Error(
          `Erreur lors de l'upload de la nouvelle miniature: ${error.message}`
        );
      }
    }

    try {
      const asset = await assetTable.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.category !== undefined && {
            category: input.category as any,
          }),
          ...(input.type !== undefined && {
            type: input.type as any,
          }),
          ...(input.tags !== undefined && { tags: input.tags }),
          ...(fileKey !== undefined && { file: fileKey }),
          ...(thumbnailKey !== undefined && { thumbnail: thumbnailKey }),
        },
      });

      // delete old keys after a confirmed DB write.
      if (fileKey && existing.file && existing.file !== fileKey) {
        await deleteFile(existing.file);
      }
      if (
        thumbnailKey &&
        existing.thumbnail &&
        existing.thumbnail !== thumbnailKey
      ) {
        await deleteFile(existing.thumbnail);
      }

      return withPublicUrls(asset);
    } catch (error: any) {
      if (fileKey) await deleteFile(fileKey);
      if (thumbnailKey) await deleteFile(thumbnailKey);
      throw new Error(
        `Erreur lors de la mise à jour de l'asset: ${error.message}`
      );
    }
  }

  /**
   * Delete asset and remove its storage keys.
   */
  async deleteAsset(id: string) {
    const existing = await this.getAssetById(id);

    try {
      const asset = await assetTable.delete({ where: { id } });
      await deleteFile(existing.file);
      if (existing.thumbnail) await deleteFile(existing.thumbnail);
      return asset;
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la suppression de l'asset: ${error.message}`
      );
    }
  }

  /**
   * Bulk delete; partial success.
   */
  async bulkDeleteAssets(ids: string[]) {
    const results = {
      deleted: 0,
      failed: [] as { id: string; reason: string }[],
    };

    for (const id of ids) {
      try {
        await this.deleteAsset(id);
        results.deleted++;
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
}
