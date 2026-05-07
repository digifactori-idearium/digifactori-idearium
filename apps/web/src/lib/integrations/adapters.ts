//  Generic field mapper
// Supports dot and bracket notation paths, e.g. "previews.preview-hq-mp3" or "tags.0" , tags[0].name"
function resolve(obj: any, expr: string): any {
  if (!expr) return undefined;

  // Split fallback chain: a ?? b ?? c
  const parts = expr.split(/\?\?/).map(p => p.trim());

  for (const part of parts) {
    const value = resolveSingle(obj, part);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function resolveSingle(obj: any, path: string): any {
  if (!path) return undefined;

  // Convert:
  // previews?.['preview-hq-mp3'] → previews.preview-hq-mp3
  // tags[0].name → tags.0.name
  const normalized = path
    .replace(/\?\./g, '.') // remove optional chaining
    .replace(/\[['"]([^'"]+)['"]\]/g, '.$1') // ['key'] → .key
    .replace(/\[(\d+)\]/g, '.$1'); // [0] → .0

  return normalized
    .split('.')
    .filter(Boolean)
    .reduce((acc, key) => acc?.[key], obj);
}

function mapItem(raw: any, fm: Record<string, string>): MediaItem {
  return {
    id: String(resolve(raw, fm.id) ?? raw.id ?? ''),
    name: String(resolve(raw, fm.name) ?? 'Unknown'),
    category: String(resolve(raw, fm.category) ?? ''),
    file: String(resolve(raw, fm.file) ?? ''),
    thumbnail: fm.thumbnail
      ? String(resolve(raw, fm.thumbnail) ?? '')
      : undefined,
  };
}

// corsproxy: to avoid proxy errors
const proxy = (url: string) =>
  `https://corsproxy.io/?${encodeURIComponent(url)}`;

//  Poly.pizza
async function polyPizzaFetch(
  integration: Integration,
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const base = integration.url;

  const finalUrl = searchTerm.trim()
    ? `${base}/${encodeURIComponent(searchTerm.trim())}`
    : base;

  const params = new URLSearchParams({
    license: '1',
    page: String(page),
    limit: '32',
  });

  const res = await fetch(proxy(`${finalUrl}?${params}`), {
    headers: { 'x-auth-token': integration.key ?? '' },
  });

  if (res.status === 401) throw new Error('poly.pizza: invalid API key');
  if (!res.ok) throw new Error(`poly.pizza: ${res.status}`);

  const data = await res.json();
  const results: any[] = Array.isArray(data?.results) ? data.results : [];

  return {
    items: results.map(r =>
      mapItem(r, integration.fieldMapping as unknown as Record<string, string>)
    ),
    hasMore: results.length >= 32,
  };
}

// Sketchfab (problem to get the GLB requires OAuth)
async function sketchfabFetch(
  integration: Integration,
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const params = new URLSearchParams({
    type: 'models',
    downloadable: 'true',
    count: '24',
    ...(searchTerm.trim() ? { q: searchTerm.trim() } : {}),
    ...(page > 0 ? { cursor: String(page * 24) } : {}),
  });

  const res = await fetch(proxy(`${integration.url}?${params}`), {
    headers: integration.key
      ? { Authorization: `Token ${integration.key}` }
      : {},
  });

  if (res.status === 401) throw new Error('Sketchfab: invalid API key');
  if (!res.ok) throw new Error(`Sketchfab: ${res.status}`);

  const data = await res.json();
  const results: any[] = Array.isArray(data?.results) ? data.results : [];

  return {
    items: results.map(r =>
      mapItem(r, integration.fieldMapping as unknown as Record<string, string>)
    ),
    hasMore: Boolean(data?.next),
  };
}

// Freesound
async function freesoundFetch(
  integration: Integration,
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const params = new URLSearchParams({
    query: searchTerm.trim() || 'sound effects',
    fields: 'id,name,previews,tags',
    page_size: '50',
    page: String(page + 1),
    token: integration.key ?? '',
  });

  const res = await fetch(proxy(`${integration.url}?${params}`));

  if (res.status === 401) throw new Error('Freesound: invalid API key');
  if (!res.ok) throw new Error(`Freesound: ${res.status}`);

  const data = await res.json();
  const results: any[] = Array.isArray(data?.results) ? data.results : [];

  return {
    items: results.map(r =>
      mapItem(r, integration.fieldMapping as unknown as Record<string, string>)
    ),
    hasMore: Boolean(data?.next),
  };
}

// Adapter registry
type AdapterFn = (
  integration: Integration,
  searchTerm: string,
  page: number
) => Promise<FetchResult>;

const REGISTRY: { pattern: RegExp; fn: AdapterFn }[] = [
  { pattern: /poly\.pizza/, fn: polyPizzaFetch },
  { pattern: /sketchfab\.com/, fn: sketchfabFetch },
  { pattern: /freesound\.org/, fn: freesoundFetch },
];

export function fetchFromIntegration(
  integration: Integration,
  searchTerm: string,
  page: number
): Promise<FetchResult> {
  const adapter = REGISTRY.find(r => r.pattern.test(integration.url))?.fn;
  if (!adapter)
    throw new Error(`No adapter registered for: ${integration.url}`);
  return adapter(integration, searchTerm, page);
}
