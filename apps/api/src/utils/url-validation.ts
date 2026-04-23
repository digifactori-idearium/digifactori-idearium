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
      const urlWithParam = new URL(endpointUrl);
      urlWithParam.searchParams.set(paramName, apiKey);
      candidates.push(urlWithParam.toString());
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
    { 'X-API-Key': apiKey },
    { 'api-key': apiKey },
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

async function probeEndpoint(
  targetUrl: string,
  authHeaders: AuthHeaders,
  expectedStatus: number
): Promise<boolean> {
  for (const method of ['GET', 'HEAD'] as HttpMethod[]) {
    const status = await sendProbeRequest(targetUrl, authHeaders, method);
    if (status === expectedStatus) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates if a URL is accessible with the given credentials.
 * @param url - Endpoint URL (supports http/https/cloudinary)
 * @param apiKey - Optional API key/secret
 * @returns true if validation passes
 */
export async function isUrlReachable(
  rawUrl: string,
  apiKey?: string
): Promise<boolean> {
  const scheme = detectUrlScheme(rawUrl);
  if (scheme === 'unknown') return false;

  // Cloudinary validation
  if (scheme === 'cloudinary') {
    const credentials = parseCloudinaryUrl(rawUrl, apiKey);
    if (!credentials) return false;

    const { apiKey: cloudKey, apiSecret, cloudName } = credentials;
    const pingUrl = `https://api.cloudinary.com/v1_1/${cloudName}/ping`;
    const authHeaders = {
      Authorization: `Basic ${btoa(`${cloudKey}:${apiSecret}`)}`,
    };

    return probeEndpoint(pingUrl, authHeaders, 200);
  }

  // HTTP/HTTPS validation
  // No key  public API
  if (!apiKey) {
    return probeEndpoint(rawUrl, {}, 200);
  }

  // With key; the base URL must reject without key first
  const noKeyStatus = await sendProbeRequest(rawUrl, {}, 'GET');
  if (noKeyStatus !== 401 && noKeyStatus !== 403) return false;

  // Then must accept with key
  for (const url of buildCandidateUrls(rawUrl, apiKey)) {
    for (const headers of buildCandidateAuthHeaders(apiKey)) {
      if (await probeEndpoint(url, headers, 200)) return true;
    }
  }

  return false;
}
