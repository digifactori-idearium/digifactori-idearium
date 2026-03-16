import { useState, useCallback, useEffect } from 'react';
import translate from 'translate';

const API_KEY = '42e4fc678abc42adafdcfad16293a3eb';

translate.engine = 'libre'; // "google", "yandex", "libre", "deepl"
// translate.key = process.env.DEEPL_KEY;

// WE CAN CREATE OUR OWN API FOR FREE WITH SELF HOSTING OF LIBRETRANSLATE ⚠️⚠️⚠️⚠️⚠️

async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';

  try {
    const translated = await translate(text, { from: 'fr', to: 'en' });
    console.log(translate);
    return translated;
  } catch (err) {
    console.error('Translation fetch failed:', err);
    return text;
  }
}

export function useAssets(searchTerm: string = '', category?: number) {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchAssets = useCallback(
    async (isNewSearch: boolean = false) => {
      if (loading || (!hasMore && !isNewSearch)) return;

      setLoading(true);
      const pageToFetch = isNewSearch ? 0 : page;

      try {
        const baseUrl = `https://api.poly.pizza/v1.1/search`;

        let searchQuery = searchTerm.trim();
        // Translate only on the first page of a new search
        if (searchQuery && isNewSearch) {
          searchQuery = await translateToEnglish(searchQuery);
        }

        const finalUrl = searchQuery
          ? `${baseUrl}/${encodeURIComponent(searchQuery)}`
          : baseUrl;

        const params = new URLSearchParams({
          license: '1',
          page: pageToFetch.toString(),
          limit: '32',
        });

        if (category !== undefined) {
          params.append('category', category.toString());
        }

        const urlWithParams = `${finalUrl}?${params.toString()}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlWithParams)}`;

        const response = await fetch(proxyUrl, {
          headers: { 'x-auth-token': API_KEY },
        });

        if (response.status === 401) {
          setHasMore(false);
          return;
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];

        if (results.length < 32) setHasMore(false);

        const mapped = results.map((item: any) => ({
          id: item.ID,
          name: item.Title,
          category: item.Category || 'Other',
          file: item.Download,
          thumbnail: item.Thumbnail,
        }));

        setAssets(prev => (isNewSearch ? mapped : [...prev, ...mapped]));
        setPage(pageToFetch + 1);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, category, page, loading, hasMore]
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchAssets(true);
  }, [searchTerm, category]);

  return { assets, loading, hasMore, fetchNextPage: () => fetchAssets(false) };
}
