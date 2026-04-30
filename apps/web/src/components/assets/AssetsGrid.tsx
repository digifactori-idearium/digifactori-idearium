import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AssetTile } from './AssetTile';

import { TooltipButton } from '@/components/common/button';
import { useAssets } from '@/hooks/useAssets';
import { CATEGORIES } from '@/lib/constants';

export function AssetsGrid({ query }: { query?: string }) {
  // Use number for the API state
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);

  const { items, loading, fetchNextPage, hasMore } = useAssets(
    query,
    selectedCategoryId
  );

  const observerRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    return items.reduce(
      (acc, asset) => {
        const catConfig = CATEGORIES.find(c => c.en === asset.category);

        const categoryName = catConfig ? catConfig.fr : 'Autre';

        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(asset);
        return acc;
      },
      {} as Record<string, AssetItem[]>
    );
  }, [items]);

  const activeCategoryLabel = useMemo(() => {
    return CATEGORIES.find(c => c.id === selectedCategoryId)?.fr;
  }, [selectedCategoryId]);

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
      {selectedCategoryId !== undefined ? (
        <>
          {/* DETAIL VIEW: Shows when a category is clicked */}
          <div className="flex justify-between items-center">
            <TooltipButton
              onClick={() => setSelectedCategoryId(undefined)}
              tooltip="Retour"
              className="bg-transparent hover:bg-transparent text-white/80 hover:text-mauve p-0!"
            >
              <ArrowLeft size={16} />
            </TooltipButton>
            <h3 className="text-sm font-semibold text-white/80 capitalize">
              {activeCategoryLabel}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {grouped[activeCategoryLabel || '']?.map((asset, idx) => (
              <AssetTile key={idx} asset={asset} />
            ))}
          </div>
        </>
      ) : (
        Object.entries(grouped).map(([categoryName, items]) => (
          <div key={categoryName} className="flex flex-col gap-1">
            <h3
              onClick={() => {
                const catObj = CATEGORIES.find(c => c.fr === categoryName);
                setSelectedCategoryId(catObj?.id);
              }}
              className="text-sm font-semibold p-1! w-fit rounded hover:bg-white/5 text-white/80 capitalize cursor-pointer hover:text-white transition-colors"
            >
              {categoryName + ' ›'}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {items.map((asset, idx) => (
                <AssetTile key={idx} asset={asset} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* INFINITE SCROLL OBSERVER */}
      <div ref={observerRef} className="h-fit flex items-center justify-center">
        {loading && (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
