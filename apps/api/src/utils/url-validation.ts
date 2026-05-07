/**
 * @file integration-validator.ts
 * @description Utilities for validating external API integrations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UrlScheme = 'http' | 'https' | 'cloudinary' | 'unknown';
type HttpMethod = 'GET' | 'HEAD';
type AuthHeaders = Record<string, string>;

interface CloudinaryCredentials {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROBE_TIMEOUT_MS = 5_000;

const AUTH_QUERY_PARAM_NAMES = [
  'api_key',
  'apikey',
  'key',
  'token',
  'access_token',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectUrlScheme(rawUrl: string): UrlScheme {
  if (rawUrl.startsWith('cloudinary://')) return 'cloudinary';
  if (rawUrl.startsWith('https://')) return 'https';
  if (rawUrl.startsWith('http://')) return 'http';
  return 'unknown';
}

function parseCloudinaryUrl(
  cloudinaryUrl: string,
  externalSecret?: string
): CloudinaryCredentials | null {
  const pattern = /^cloudinary:\/\/([^:@]+)(?::([^@]+))?@(\w+)$/;
  const match = cloudinaryUrl.match(pattern);
  if (!match) return null;

  const [, apiKey, embeddedSecret, cloudName] = match;
  const apiSecret = embeddedSecret ?? externalSecret;
  if (!apiSecret) return null;

  return { apiKey, apiSecret, cloudName };
}

function buildCandidateUrls(endpointUrl: string, apiKey?: string): string[] {
  const candidates: string[] = [endpointUrl];
  if (!apiKey) return candidates;

  try {
    for (const paramName of AUTH_QUERY_PARAM_NAMES) {
      const url = new URL(endpointUrl);
      url.searchParams.set(paramName, apiKey);
      candidates.push(url.toString());
    }
  } catch {
    // Invalid URL - use original only
  }

  return [...new Set(candidates)];
}

function buildCandidateAuthHeaders(apiKey?: string): AuthHeaders[] {
  if (!apiKey) return [{}];

  return [
    { Authorization: `Bearer ${apiKey}` },
    { Authorization: `Token ${apiKey}` },
    { Authorization: `Basic ${btoa(`${apiKey}:`)}` },
    { 'X-API-Key': apiKey },
    { 'api-key': apiKey },
    { 'x-auth-token': apiKey },
    {},
  ];
}

async function sendProbeRequest(
  targetUrl: string,
  authHeaders: AuthHeaders,
  method: HttpMethod
): Promise<number | null> {
  try {
    const response = await fetch(targetUrl, {
      method,
      headers: { Accept: 'application/json', ...authHeaders },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return response.status;
  } catch {
    return null;
  }
}

async function probeOnce(
  url: string,
  headers: AuthHeaders
): Promise<number | null> {
  return sendProbeRequest(url, headers, 'GET'); // GET only (more reliable)
}

function isSuccess(status: number | null): boolean {
  return status !== null && status >= 200 && status < 300;
}

function isAuthError(status: number | null): boolean {
  return status === 401 || status === 403;
}

async function probeEndpointWithAuthCheck(
  url: string,
  apiKey: string
): Promise<boolean> {
  // Baseline (no auth)
  const baselineStatus = await probeOnce(url, {});

  for (const headers of buildCandidateAuthHeaders(apiKey)) {
    const authStatus = await probeOnce(url, headers);

    if (isSuccess(authStatus)) return true;

    if (
      isAuthError(baselineStatus) &&
      authStatus !== baselineStatus &&
      authStatus !== null
    ) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates if a URL is accessible with the given credentials.
 *
 * Strategy:
 *  - Cloudinary URLs → dedicated ping endpoint with Basic auth
 *  - No key         → public API, just check reachability (200)
 *  - With key       → try all known auth header/param combos first.
 *                     Covers lenient APIs and return 401/403 without credentials.
 *
 * @param rawUrl - Endpoint URL (supports http / https / cloudinary)
 * @param apiKey - Optional API key / secret
 * @returns true if validation passes
 */
export async function isUrlReachable(
  rawUrl: string,
  apiKey?: string
): Promise<boolean> {
  const scheme = detectUrlScheme(rawUrl);
  if (scheme === 'unknown') return false;

  // Cloudinary
  if (scheme === 'cloudinary') {
    const credentials = parseCloudinaryUrl(rawUrl, apiKey);
    if (!credentials) return false;

    const { apiKey: cloudKey, apiSecret, cloudName } = credentials;
    const pingUrl = `https://api.cloudinary.com/v1_1/${cloudName}/ping`;

    const authHeaders = {
      Authorization: `Basic ${btoa(`${cloudKey}:${apiSecret}`)}`,
    };

    const status = await probeOnce(pingUrl, authHeaders);
    return isSuccess(status);
  }

  // Public API (no key)
  if (!apiKey) {
    const status = await probeOnce(rawUrl, {});
    return isSuccess(status);
  }

  // Authenticated API
  for (const url of buildCandidateUrls(rawUrl, apiKey)) {
    if (await probeEndpointWithAuthCheck(url, apiKey)) return true;
  }

  return false;
}
