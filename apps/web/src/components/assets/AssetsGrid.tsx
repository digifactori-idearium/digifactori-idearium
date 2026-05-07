import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { AssetTile } from './AssetTile';

import { TooltipButton } from '@/components/common/button';
import { useAssets } from '@/hooks/useAssets';
import { ASSET_TYPE_FR, matchAssetType } from '@/lib/asset-types';

/**
 * Resolve a display label for an item's type.
 *   We map it to the closest AssetCategory via matchAssetType, then translate.
 */
function resolveLabel(item: MediaItem): string {
  // Internal assets expose Category directly
  const typed = (item as any).category as AssetCategory | undefined;
  if (typed && typed in ASSET_TYPE_FR) return ASSET_TYPE_FR[typed];

  // External assets: map the raw category string
  const mapped = matchAssetType(item.category ?? '');
  return ASSET_TYPE_FR[mapped];
}

export function AssetsGrid({ query }: Readonly<{ query?: string }>) {
  const [drillLabel, setDrillLabel] = useState<string | undefined>(undefined);

  const { items, loading, fetchNextPage, hasMore } = useAssets(query);
  const observerRef = useRef<HTMLDivElement>(null);

  // Collect unique resolved labels for pills
  const labels = [...new Set(items.map(resolveLabel))].sort((a, b) =>
    a.localeCompare(b, 'fr')
  );

  const visibleItems =
    drillLabel === undefined
      ? items
      : items.filter(i => resolveLabel(i) === drillLabel);

  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    const current = observerRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchNextPage, loading, hasMore]);

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto">
      {/* Category filter pills */}
      {labels.length > 1 && (
        <div className="flex flex-wrap gap-1 pb-1">
          <button
            type="button"
            onClick={() => setDrillLabel(undefined)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              drillLabel === undefined
                ? 'bg-mauve border-mauve text-white'
                : 'border-white/20 text-white/60 hover:text-white bg-transparent'
            }`}
          >
            Tout
          </button>
          {labels.map(label => (
            <button
              key={label}
              type="button"
              onClick={() =>
                setDrillLabel(prev => (prev === label ? undefined : label))
              }
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                drillLabel === label
                  ? 'bg-mauve border-mauve text-white'
                  : 'border-white/20 text-white/60 hover:text-white bg-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Back button */}
      {drillLabel !== undefined && (
        <div className="flex items-center gap-2">
          <TooltipButton
            onClick={() => setDrillLabel(undefined)}
            tooltip="Retour"
            className="bg-transparent hover:bg-transparent text-white/80 hover:text-mauve p-0!"
          >
            <ArrowLeft size={16} />
          </TooltipButton>
          <h3 className="text-sm font-semibold text-white/80 capitalize">
            {drillLabel}
          </h3>
        </div>
      )}

      {/* Asset grid */}
      <div className="grid grid-cols-3 gap-2">
        {visibleItems.map((asset, id) => (
          <AssetTile key={id} asset={asset as AssetItem} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="h-fit flex items-center justify-center">
        {loading && (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
