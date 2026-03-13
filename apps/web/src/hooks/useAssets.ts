import { useState, useCallback, useEffect } from 'react';

const API_KEY = '42e4fc678abc42adafdcfad16293a3eb';

export function useAssets(searchTerm: string = '') {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [page, setPage] = useState(0); // API is 0-indexed
  const [loading, setLoading] = useState(false);

  const fetchAssets = useCallback(
    async (isNewSearch: boolean = false) => {
      if (loading) return;
      setLoading(true);

      const currentPage = isNewSearch ? 0 : page;

      try {
        const params = new URLSearchParams({
          keyword: searchTerm || 'all',
          license: '1',
          page: currentPage.toString(),
          limit: '32',
        });

        const url = `https://api.poly.pizza/v1.1/search?${params.toString()}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl, {
          headers: { 'x-auth-token': API_KEY },
        });

        const data = await response.json();

        if (data?.results) {
          const mapped: AssetItem[] = data.results.map((item: any) => ({
            id: item.ID,
            name: item.Title,
            category: item.Category || 'Other',
            file: item.Download,
            thumbnail: item.Thumbnail,
          }));

          setAssets(prev => (isNewSearch ? mapped : [...prev, ...mapped]));
          setPage(currentPage + 1);
        }
      } catch (err) {
        console.error('Poly Pizza Error:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, page, loading]
  );

  useEffect(() => {
    fetchAssets(true);
  }, [searchTerm]);

  return { assets, loading, fetchNextPage: () => fetchAssets(false) };
}
