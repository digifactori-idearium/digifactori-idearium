import { getAssets } from '@/services/asset.service';

const PAGE_SIZE = 32;

/**
 * Map an internal Asset record to the shared MediaItem shape.
 *.
 */
function assetToMediaItem(asset: Asset): MediaItem {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    ...(asset.category ? { category: asset.category } : {}),
    file: asset.file,
    fileUrl: asset.fileUrl ?? undefined,
    thumbnail: asset.thumbnail ?? undefined,
    thumbnailUrl: asset.thumbnailUrl ?? undefined,
  };
}

/**
 * Internal 3D model assets (type = MODEL_3D).
 * Supports search and pagination
 */
export async function fetchInternalAssets(
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const data = await getAssets({
    type: 'MODEL_3D',
    search: searchTerm.trim() || undefined,
    page: page + 1,
    limit: PAGE_SIZE,
  });

  return {
    items: data.items.map(assetToMediaItem),
    hasMore: page + 1 < data.totalPages,
  };
}

/**
 * Internal sound assets (type = SOUND).
 */
export async function fetchInternalSounds(
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const data = await getAssets({
    type: 'SOUND',
    search: searchTerm.trim() || undefined,
    page: page + 1,
    limit: PAGE_SIZE,
  });

  return {
    items: data.items.map(assetToMediaItem),
    hasMore: page + 1 < data.totalPages,
  };
}

/**
 * Internal image assets (type = IMAGE).
 */
export async function fetchInternalImages(
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const data = await getAssets({
    type: 'IMAGE',
    search: searchTerm.trim() || undefined,
    page: page + 1,
    limit: PAGE_SIZE,
  });

  return {
    items: data.items.map(assetToMediaItem),
    hasMore: page + 1 < data.totalPages,
  };
}
