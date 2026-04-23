import { useState, useCallback, useEffect, useRef } from 'react';

const API_KEY = 'LPq9sCaRfxt8gsMvhds3xwjUfgk6kzqdjNIkGPO3';
const PAGE_SIZE = 50;

async function translateToFrench(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`
    );
    const data = await res.json();
    if (data?.responseStatus !== 200) {
      return text;
    }
    return data?.responseData?.translatedText ?? text;
  } catch {
    return text;
  }
}

export async function searchSounds(query: string): Promise<any[]> {
  const params = new URLSearchParams({
    query: query.trim() || 'sound effects',
    fields: 'id,name,previews,tags',
    page_size: '10',
    page: '1',
    token: API_KEY,
  });

  const finalUrl = `https://freesound.org/apiv2/search/text/?${params.toString()}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(finalUrl)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) return [];

  const data = await res.json();
  const results: any[] = Array.isArray(data?.results) ? data.results : [];

  return results.map(item => ({
    value:
      item.previews?.['preview-hq-mp3'] ??
      item.previews?.['preview-lq-mp3'] ??
      '',
    label: (item.name ?? 'Unknown').replace(/\.[^/.]+$/, '').slice(0, 40),
  }));
}

export function useSound(searchTerm: string = '', category?: number) {
  const [sounds, setSounds] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Use refs to avoid stale closures in fetchNextPage
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const searchTermRef = useRef(searchTerm);

  // Sync searchTerm ref
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const fetchPage = useCallback(
    async (pageNum: number, isNewSearch: boolean) => {
      if (loadingRef.current || (!hasMoreRef.current && !isNewSearch)) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const params = new URLSearchParams({
          query: searchTermRef.current.trim() || 'sound effects',
          fields: 'id,name,previews,tags,category',
          // filter: 'category:"sound%20effects"',
          page_size: String(PAGE_SIZE),
          page: String(pageNum),
          token: API_KEY,
        });

        const finalUrl = `https://freesound.org/apiv2/search/text/?${params.toString()}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(finalUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
          hasMoreRef.current = false;
          setHasMore(false);
          return;
        }

        const data = await response.json();
        const results: any[] = Array.isArray(data?.results) ? data.results : [];

        const nextHasMore = Boolean(data.next);
        hasMoreRef.current = nextHasMore;
        setHasMore(nextHasMore);

        const mapped = await Promise.all(
          results.map(async (item: any) => {
            const rawName = (item.name ?? 'Unknown')
              .replace(/\.[^/.]+$/, '')
              .slice(0, 40);
            const frenchName = await translateToFrench(rawName);

            return {
              id: item.id,
              name: rawName,
              frName:
                frenchName.slice(0, 35) + (frenchName.length > 35 ? '...' : ''),
              category: item.tags?.[0] ?? 'Other',
              file:
                item.previews?.['preview-hq-mp3'] ??
                item.previews?.['preview-lq-mp3'] ??
                '',
            } satisfies MusicItem;
          })
        );

        setSounds(prev => (isNewSearch ? mapped : [...prev, ...mapped]));
        pageRef.current = pageNum + 1;
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    []
  ); // stable — no deps, uses refs

  // Reset and fetch fresh on search term change
  useEffect(() => {
    setSounds([]);
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
    setHasMore(true);
    fetchPage(1, true);
  }, [searchTerm, category, fetchPage]);

  const fetchNextPage = useCallback(() => {
    fetchPage(pageRef.current, false);
  }, [fetchPage]);

  return { sounds, loading, hasMore, fetchNextPage };
}
