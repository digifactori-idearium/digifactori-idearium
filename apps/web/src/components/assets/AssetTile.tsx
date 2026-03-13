import { useDraggable } from '@dnd-kit/core';

import { AssetThumbnail } from './AssetThumbnail';

type Props = {
  asset: AssetItem;
};

export function AssetTile({ asset }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: asset.id,
    data: asset,
  });

  return (
    <div
      className={`group flex flex-col gap-1 p-0.5 rounded-xl select-none transition-all`}
    >
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
          {asset.thumbnail ? (
            <img
              src={asset.thumbnail}
              loading="lazy"
              className="w-full h-full object-contain mix-blend-multiply bg-transparent contrast-125"
            />
          ) : (
            <AssetThumbnail file={asset.file} />
          )}
        </div>
      </div>

      <span
        className="text-[10px] font-medium truncate text-center text-white/50 
                       group-hover:text-white/90"
      >
        {asset.name}
      </span>
    </div>
  );
}
