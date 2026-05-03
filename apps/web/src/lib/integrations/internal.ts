import { getAssets } from '@/services/asset.service';
import { getAllVoxelModels } from '@/services/voxel.service';

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

/**
 * Internal voxel models (type = MODEL_3D, sourced from the VoxelModel table).
 */
export async function fetchInternalVoxelModels(
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const response = await getAllVoxelModels();
  const allModels = response.data ?? [];

  const term = searchTerm.trim().toLowerCase();
  const filtered = term
    ? allModels.filter(m => m.name.toLowerCase().includes(term))
    : allModels;

  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  const items: MediaItem[] = slice
    .filter(m => m.model)
    .map(m => ({
      id: m.id,
      name: m.name,
      type: 'MODEL_3D',
      file: m.model!,
    }));

  return {
    items,
    hasMore: start + PAGE_SIZE < filtered.length,
  };
}
