import { useEffect, useMemo, useRef } from 'react';

import { AssetTile } from './AssetTile';

import { useAssets } from '@/hooks/useAssets';

export function AssetsGrid() {
  const { assets, loading, fetchNextPage } = useAssets();
  const observerRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    return assets.reduce(
      (acc, asset) => {
        const category = asset.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(asset);
        return acc;
      },
      {} as Record<string, AssetItem[]>
    );
  }, [assets]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage]);

  return (
    <div className="flex flex-col gap-1 p-2 overflow-y-auto">
      {Object.entries(grouped).map(([category, assets]) => (
        <div key={category} className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-white/80 capitalize">
            {category}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {assets.map((asset, idx) => (
              <AssetTile key={idx} asset={asset} />
            ))}
          </div>
        </div>
      ))}

      {/* Sentinel element for Infinite Scroll */}
      <div ref={observerRef} className="h-20 flex items-center justify-center">
        {loading && (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
