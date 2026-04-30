import { useState, useEffect } from 'react';

import { handleApiError } from '@/lib/api';
import { fetchStorageFile } from '@/services/asset.service';

interface UseStorageFileOptions {
  autoFetch?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (blob: Blob) => void;
}

interface UseStorageFileReturn {
  url: string | null;
  blob: Blob | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearUrl: () => void;
}

export const useStorageFile = (
  fileKey: string | null,
  options: UseStorageFileOptions = {}
): UseStorageFileReturn => {
  const { autoFetch = true, onError, onSuccess } = options;

  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFile = async () => {
    if (!fileKey) {
      setError('No file key provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileBlob = await fetchStorageFile(fileKey);
      const objectUrl = URL.createObjectURL(fileBlob);

      setBlob(fileBlob);
      setUrl(objectUrl);

      onSuccess?.(fileBlob);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Failed to fetch storage file:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearUrl = () => {
    if (url) {
      URL.revokeObjectURL(url);
    }
    setUrl(null);
    setBlob(null);
  };

  useEffect(() => {
    if (autoFetch && fileKey) {
      fetchFile();
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [fileKey, autoFetch]);

  return {
    url,
    blob,
    loading,
    error,
    refetch: fetchFile,
    clearUrl,
  };
};
