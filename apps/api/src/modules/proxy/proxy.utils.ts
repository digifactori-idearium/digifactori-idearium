import { prisma } from '@/config/client.config';

let cachedHostnames: Set<string> | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

async function getAllowedHostnames(): Promise<Set<string>> {
  if (cachedHostnames && Date.now() < cacheExpiresAt) {
    return cachedHostnames;
  }

  const integrations = await prisma.integration.findMany({
    where: { settingId: 1, isActive: true },
    select: { url: true },
  });

  cachedHostnames = new Set(
    integrations.flatMap(i => {
      try {
        return [new URL(i.url).hostname];
      } catch {
        return [];
      }
    })
  );

  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cachedHostnames;
}

export function clearProxyCache(): void {
  cachedHostnames = null;
  cacheExpiresAt = 0;
}

export async function isAllowedUrl(rawUrl: string): Promise<boolean> {
  try {
    const { hostname } = new URL(rawUrl);
    const allowed = await getAllowedHostnames();
    return (
      allowed.has(hostname) ||
      [...allowed].some(h => hostname.endsWith(`.${h}`))
    );
  } catch {
    return false;
  }
}
