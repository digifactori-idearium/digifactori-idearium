import { useState, useEffect, useRef, useCallback } from 'react';

import { handleApiError } from '@/lib/api';
import axiosInstance from '@/services/axios.service';

//  Signed-URL cache
// Shared across all hook instances. Entries expire 60 s before the server TTL
// so we never hand the browser a URL that's about to die.

interface CacheEntry {
  url: string;
  expiresAt: number;
}

const signedUrlCache = new Map<string, CacheEntry>();
const TTL_BUFFER_MS = 60_000;

function getCachedUrl(key: string): string | null {
  const entry = signedUrlCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    signedUrlCache.delete(key);
    return null;
  }
  return entry.url;
}

function setCachedUrl(key: string, url: string, expiresAt: string): void {
  signedUrlCache.set(key, {
    url,
    expiresAt: new Date(expiresAt).getTime() - TTL_BUFFER_MS,
  });
}

// API call — uses axios so auth session is included automatically.
async function fetchSignedUrl(
  fileKey: string
): Promise<{ url: string; expiresAt: string }> {
  const response = await axiosInstance.get<{
    data: { url: string; expiresAt: string };
  }>(`/api/storage/signed-url?key=${encodeURIComponent(fileKey)}`);
  return response.data.data;
}

// Hook
interface UseStorageUrlOptions {
  /** Skip fetching automatically. Call `refetch()` manually instead. */
  autoFetch?: boolean;
  onError?: (error: string) => void;
}

interface UseStorageUrlReturn {
  /** Direct URL to the asset */
  url: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Resolves a storage key to a usable URL.
 *
 * Strategy:
 *   - If the key is already an absolute URL (external asset), return it as-is.
 *   - Hit GET /storage/signed-url, cache the result until near-expiry.
 *   - The signed URL points straight at S3/R2/Azure — no proxy, no blob.

 */
export function useStorageUrl(
  fileKey: string | null,
  options: UseStorageUrlOptions = {}
): UseStorageUrlReturn {
  const { autoFetch = true, onError } = options;

  const [url, setUrl] = useState<string | null>(() => {
    // external assets url.
    if (
      fileKey &&
      (fileKey.startsWith('http') || fileKey.startsWith('blob:'))
    ) {
      return fileKey;
    }
    // Check cache synchronously to avoid flicker on re-mount.
    if (fileKey) return getCachedUrl(fileKey);
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileKeyRef = useRef(fileKey);
  fileKeyRef.current = fileKey;

  const fetchUrl = useCallback(async () => {
    const key = fileKeyRef.current;
    if (!key) return;

    // external
    if (key.startsWith('http') || key.startsWith('blob:')) {
      setUrl(key);
      return;
    }

    // Cache hit.
    const cached = getCachedUrl(key);
    if (cached) {
      setUrl(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { url: signedUrl, expiresAt } = await fetchSignedUrl(key);
      setCachedUrl(key, signedUrl, expiresAt);

      // Only update state if the key hasn't changed
      if (fileKeyRef.current === key) {
        setUrl(signedUrl);
      }
    } catch (err) {
      const message = handleApiError(err);
      if (fileKeyRef.current === key) {
        setError(message);
        onError?.(message);
      }
    } finally {
      if (fileKeyRef.current === key) {
        setLoading(false);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!fileKey) {
      setUrl(null);
      setError(null);
      return;
    }

    // external
    if (fileKey.startsWith('http') || fileKey.startsWith('blob:')) {
      setUrl(fileKey);
      return;
    }

    if (autoFetch) fetchUrl();
  }, [fileKey, autoFetch, fetchUrl]);

  return { url, loading, error, refetch: fetchUrl };
}

// Blob variant

interface UseStorageBlobOptions {
  autoFetch?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (blob: Blob) => void;
}

interface UseStorageBlobReturn {
  url: string | null;
  blob: Blob | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches an asset as a Blob and returns a local object URL.
 *
 */
export function useStorageBlob(
  fileKey: string | null,
  options: UseStorageBlobOptions = {}
): UseStorageBlobReturn {
  const { autoFetch = true, onError, onSuccess } = options;

  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);
  const fileKeyRef = useRef(fileKey);
  fileKeyRef.current = fileKey;

  const revoke = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const fetchBlob = useCallback(async () => {
    const key = fileKeyRef.current;
    if (!key) return;

    setLoading(true);
    setError(null);

    try {
      // Resolve the key to a fetchable URL.
      let fetchUrl: string;

      if (key.startsWith('http') || key.startsWith('blob:')) {
        fetchUrl = key;
      } else {
        const cached = getCachedUrl(key);
        if (cached) {
          fetchUrl = cached;
        } else {
          const { url: signedUrl, expiresAt } = await fetchSignedUrl(key);
          setCachedUrl(key, signedUrl, expiresAt);
          fetchUrl = signedUrl;
        }
      }

      let fileBlob: Blob;

      if (fetchUrl.startsWith('http')) {
        // Absolute URL — external provider or presigned URL, use raw fetch.
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        fileBlob = await response.blob();
      } else {
        // Relative URL — goes through the API proxy, use axios so auth
        // cookies/headers are included automatically.
        const response = await axiosInstance.get<Blob>(fetchUrl, {
          responseType: 'blob',
        });
        fileBlob = response.data;
      }

      if (fileKeyRef.current !== key) return;

      const objectUrl = URL.createObjectURL(fileBlob);
      revoke();
      objectUrlRef.current = objectUrl;

      setBlob(fileBlob);
      setUrl(objectUrl);
      onSuccess?.(fileBlob);
    } catch (err) {
      const message = handleApiError(err);
      if (fileKeyRef.current === key) {
        setError(message);
        onError?.(message);
      }
    } finally {
      if (fileKeyRef.current === key) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!fileKey) {
      revoke();
      setUrl(null);
      setBlob(null);
      return;
    }

    if (autoFetch) fetchBlob();

    return revoke; // Clean up object URL on unmount or key change.
  }, [fileKey, autoFetch, fetchBlob]);

  return { url, blob, loading, error, refetch: fetchBlob };
}

/** @deprecated Use useStorageUrl for images, useStorageBlob for binary loaders. */
export const useStorageFile = useStorageBlob;
