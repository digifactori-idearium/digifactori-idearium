import { useDraggable } from '@dnd-kit/core';

import { AssetThumbnail } from './AssetThumbnail';

import { useStorageUrl } from '@/hooks/useStorageFile';
import { isStorageKey } from '@/lib/asset';

type Props = Readonly<{
  asset: AssetItem;
}>;

/**
 * AssetTile renders a draggable asset card.
 */
export function AssetTile({ asset }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: asset.id,
    data: asset,
  });

  const thumbnailKey =
    !asset.thumbnailUrl && asset.thumbnail && isStorageKey(asset.thumbnail)
      ? asset.thumbnail
      : null;

  const fileKey =
    !asset.fileUrl && asset.file && isStorageKey(asset.file)
      ? asset.file
      : null;

  const { url: resolvedThumbnailUrl } = useStorageUrl(thumbnailKey, {
    autoFetch: !!thumbnailKey,
  });

  const { url: resolvedFileUrl } = useStorageUrl(fileKey, {
    autoFetch: !!fileKey && !asset.thumbnail && !asset.thumbnailUrl,
  });

  const thumbnailSrc =
    asset.thumbnailUrl ??
    (asset.thumbnail && !isStorageKey(asset.thumbnail)
      ? asset.thumbnail
      : null) ??
    resolvedThumbnailUrl;

  const fileSrc =
    asset.fileUrl ??
    (asset.file && !isStorageKey(asset.file) ? asset.file : null) ??
    resolvedFileUrl;

  return (
    <div className="group flex flex-col gap-1 p-0.5 rounded-xl select-none transition-all">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        className={`aspect-square rounded-lg overflow-hidden border
          select-none! touch-none! cursor-grab! active:cursor-grabbing!
          ${isDragging ? 'opacity-30' : ''}`}
      >
        <div className="w-full h-full pointer-events-none">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={asset.name}
              loading="lazy"
              className="w-full h-full object-contain mix-blend-multiply bg-transparent contrast-125"
            />
          ) : (
            <AssetThumbnail file={fileSrc || ''} />
          )}
        </div>
      </div>

      <span className="text-[10px] font-medium truncate text-center text-white/50 group-hover:text-white/90">
        {asset.name}
      </span>
    </div>
  );
}
