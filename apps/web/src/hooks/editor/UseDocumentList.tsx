import { useState, useCallback } from 'react';

import { documentsApi } from '@/services/editor.service';

interface UseDocumentListReturn {
  documents: DocumentListItem[];
  loading: boolean;
  fetchDocuments: () => Promise<void>;
  createDocument: (payload: CreateDocumentPayload) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
}

export function useDocumentList(): UseDocumentListReturn {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await documentsApi.list();
      setDocuments(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (payload: CreateDocumentPayload) => {
    const response = await documentsApi.create(payload);
    const doc = response.data;
    setDocuments(prev => [
      {
        ...doc,
        content: undefined,
        json: undefined,
      } as unknown as DocumentListItem,
      ...prev,
    ]);
    return doc.id;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await documentsApi.delete(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  return { documents, loading, fetchDocuments, createDocument, deleteDocument };
}
