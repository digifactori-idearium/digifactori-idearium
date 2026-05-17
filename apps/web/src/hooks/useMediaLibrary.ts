import { useState, useEffect, useRef, useCallback } from 'react';

import { fetchFromIntegration } from '@/lib/integrations/adapters';
import {
  fetchInternalAssets,
  fetchInternalImages,
  fetchInternalSounds,
  fetchInternalVoxelModels,
} from '@/lib/integrations/internal';
import { getIntegrations } from '@/services/settings.service';

type InternalSource = {
  kind: 'internal';
  fetch: (search: string, page: number) => Promise<FetchResult>;
};

type ExternalSource = {
  kind: 'external';
  integration: Integration;
};

const INTERNAL_SOURCES: Record<
  IntegrationType,
  Array<InternalSource['fetch']>
> = {
  MODEL_3D: [fetchInternalAssets, fetchInternalVoxelModels],
  SOUND: [fetchInternalSounds],
  IMAGE: [fetchInternalImages],
  OTHER: [],
};

export function useMediaLibrary(
  type: IntegrationType,
  searchTerm: string = ''
) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [ready, setReady] = useState(false);

  const internalSourcesRef = useRef<InternalSource[]>([]);
  const externalSourcesRef = useRef<ExternalSource[]>([]);

  const internalPagesRef = useRef<number[]>([]);
  const internalHasMoreRef = useRef<boolean[]>([]);
  const externalPagesRef = useRef<number[]>([]);
  const externalHasMoreRef = useRef<boolean[]>([]);

  const loadingRef = useRef(false);
  const searchRef = useRef(searchTerm);

  useEffect(() => {
    searchRef.current = searchTerm;
  }, [searchTerm]);

  const initInternalSources = useCallback(() => {
    const fns = INTERNAL_SOURCES[type] ?? [];
    internalSourcesRef.current = fns.map(fn => ({
      kind: 'internal',
      fetch: fn,
    }));
    internalPagesRef.current = fns.map(() => 0);
    internalHasMoreRef.current = fns.map(() => true);
  }, [type]);

  // Build source lists when type changes
  useEffect(() => {
    setReady(false);

    getIntegrations(type)
      .then(list => {
        initInternalSources();

        const active = list.filter(i => i.isActive);
        externalSourcesRef.current = active.map(i => ({
          kind: 'external' as const,
          integration: i,
        }));
        externalPagesRef.current = active.map(() => 0);
        externalHasMoreRef.current = active.map(() => true);
      })
      .catch(err => {
        console.error('[useMediaLibrary] Failed to load integrations:', err);
        initInternalSources();
        externalSourcesRef.current = [];
        externalPagesRef.current = [];
        externalHasMoreRef.current = [];
      })
      .finally(() => setReady(true));
  }, [type, initInternalSources]);

  const fetchPage = useCallback(async (isNewSearch: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const search = searchRef.current;

    if (isNewSearch) {
      internalPagesRef.current = internalSourcesRef.current.map(() => 0);
      internalHasMoreRef.current = internalSourcesRef.current.map(() => true);
      externalPagesRef.current = externalSourcesRef.current.map(() => 0);
      externalHasMoreRef.current = externalSourcesRef.current.map(() => true);
    }

    const fetches: Promise<MediaItem[]>[] = [];

    // Internal sources
    internalSourcesRef.current.forEach((src, idx) => {
      const isFirstPage = internalPagesRef.current[idx] === 0;
      if (!isFirstPage && !internalHasMoreRef.current[idx]) return;

      const page = internalPagesRef.current[idx];

      fetches.push(
        src
          .fetch(search, page)
          .then(r => {
            internalHasMoreRef.current[idx] = r.hasMore;
            internalPagesRef.current[idx] = page + 1;
            return r.items;
          })
          .catch(err => {
            console.warn(
              `[useMediaLibrary] internal source [${idx}] failed`,
              err
            );
            internalHasMoreRef.current[idx] = false;
            return [] as MediaItem[];
          })
      );
    });

    // External sources
    externalSourcesRef.current.forEach((src, idx) => {
      const isFirstPage = externalPagesRef.current[idx] === 0;
      if (!isFirstPage && !externalHasMoreRef.current[idx]) return;

      const page = externalPagesRef.current[idx];

      fetches.push(
        fetchFromIntegration(src.integration, search, page)
          .then(r => {
            externalHasMoreRef.current[idx] = r.hasMore;
            externalPagesRef.current[idx] = page + 1;
            return r.items;
          })
          .catch(err => {
            console.warn(
              `[useMediaLibrary] "${src.integration.name}" failed`,
              err
            );
            externalHasMoreRef.current[idx] = false;
            return [] as MediaItem[];
          })
      );
    });

    const results = await Promise.all(fetches);
    const merged = results.flat();

    setItems(prev => (isNewSearch ? merged : [...prev, ...merged]));

    const stillMore =
      internalHasMoreRef.current.some(Boolean) ||
      externalHasMoreRef.current.some(Boolean);

    setHasMore(stillMore);

    loadingRef.current = false;
    setLoading(false);
  }, []);

  // Reset and re-fetch when search changes or sources become ready
  useEffect(() => {
    if (!ready) return;
    fetchPage(true);
  }, [searchTerm, ready, fetchPage]);

  return {
    items,
    loading,
    hasMore,
    fetchNextPage: () => fetchPage(false),
  };
}
