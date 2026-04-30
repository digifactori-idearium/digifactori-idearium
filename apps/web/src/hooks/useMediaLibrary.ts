import { useState, useEffect, useRef, useCallback } from 'react';

import { fetchFromIntegration } from '@/lib/integrations/adapters';
import {
  fetchInternalAssets,
  fetchInternalImages,
  fetchInternalSounds,
} from '@/lib/integrations/internal';
import { getIntegrations } from '@/services/settings.service';

// Source abstraction
type InternalSource = {
  kind: 'internal';
  fetch: (search: string, page: number) => Promise<FetchResult>;
};

type ExternalSource = {
  kind: 'external';
  integration: Integration;
};

/** Internal fetch by type. */
const INTERNAL_SOURCES: Record<
  IntegrationType,
  Array<InternalSource['fetch']>
> = {
  MODEL_3D: [fetchInternalAssets],
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
  // Per-external-source page tracking so each integration paginates independently
  const externalPagesRef = useRef<number[]>([]);
  const externalHasMoreRef = useRef<boolean[]>([]);

  const internalPageRef = useRef(0);
  const internalDoneRef = useRef(false);
  const loadingRef = useRef(false);
  const searchRef = useRef(searchTerm);

  useEffect(() => {
    searchRef.current = searchTerm;
  }, [searchTerm]);

  // Build source lists when type changes.
  useEffect(() => {
    setReady(false);

    getIntegrations(type)
      .then(list => {
        internalSourcesRef.current = (INTERNAL_SOURCES[type] ?? []).map(fn => ({
          kind: 'internal',
          fetch: fn,
        }));

        externalSourcesRef.current = list
          .filter(i => i.isActive)
          .map(i => ({ kind: 'external' as const, integration: i }));

        externalPagesRef.current = list.filter(i => i.isActive).map(() => 0);
        externalHasMoreRef.current = list
          .filter(i => i.isActive)
          .map(() => true);
      })
      .catch(err => {
        console.error('[useMediaLibrary] Failed to load integrations:', err);
        internalSourcesRef.current = (INTERNAL_SOURCES[type] ?? []).map(fn => ({
          kind: 'internal',
          fetch: fn,
        }));
        externalSourcesRef.current = [];
        externalPagesRef.current = [];
        externalHasMoreRef.current = [];
      })
      .finally(() => setReady(true));
  }, [type]);

  const fetchPage = useCallback(async (isNewSearch: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const search = searchRef.current;

    // On a new search reset all pagination state
    if (isNewSearch) {
      internalPageRef.current = 0;
      internalDoneRef.current = false;
      externalPagesRef.current = externalSourcesRef.current.map(() => 0);
      externalHasMoreRef.current = externalSourcesRef.current.map(() => true);
    }

    const fetches: Promise<MediaItem[]>[] = [];

    // Internal sources (all fetched in parallel)
    if (!internalDoneRef.current) {
      const page = internalPageRef.current;

      for (const src of internalSourcesRef.current) {
        fetches.push(
          src
            .fetch(search, page)
            .then(r => {
              if (!r.hasMore) internalDoneRef.current = true;
              return r.items;
            })
            .catch(err => {
              console.warn('[useMediaLibrary] internal fetch failed', err);
              return [] as MediaItem[];
            })
        );
      }

      internalPageRef.current = page + 1;
    }

    // External sources (each tracks its own page)
    externalSourcesRef.current.forEach((src, idx) => {
      if (!externalHasMoreRef.current[idx]) return;

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

    // Merge all results
    const results = await Promise.all(fetches);
    const merged = results.flat();

    setItems(prev => (isNewSearch ? merged : [...prev, ...merged]));

    // hasMore = internal still has pages OR any external still has pages
    const stillMore =
      !internalDoneRef.current || externalHasMoreRef.current.some(Boolean);

    setHasMore(stillMore);

    loadingRef.current = false;
    setLoading(false);
  }, []);

  // Reset and re-fetch on search change or after sources are ready.
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
