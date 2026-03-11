import { AssetTile } from './AssetTile';

import { assetsLibrary } from '@/services/assets.service';

export function AssetsGrid() {
  const grouped = assetsLibrary.reduce(
    (acc, asset) => {
      const category = asset.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(asset);
      return acc;
    },
    {} as Record<string, typeof assetsLibrary>
  );

  return (
    <div className="flex flex-col gap-1 p-2 overflow-y-auto">
      {Object.entries(grouped).map(([category, assets]) => (
        <div key={category} className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-white/80 capitalize">
            {category}
          </h3>

          <div className="grid grid-cols-4 gap-1">
            {assets?.map(asset => (
              <AssetTile key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
