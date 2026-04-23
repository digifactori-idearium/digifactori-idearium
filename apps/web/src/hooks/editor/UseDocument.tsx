import { useState, useCallback, useRef } from 'react';

import { documentsApi } from '@/services/editor.service';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseDocumentReturn {
  document: Document | null;
  saveStatus: SaveStatus;
  loadDocument: (id: string) => Promise<void>;
  saveDocument: (payload: UpdateDocumentPayload) => Promise<void>;
  scheduleSave: (payload: UpdateDocumentPayload) => void;
  setDocument: React.Dispatch<React.SetStateAction<Document | null>>;
}

const AUTOSAVE_DELAY = 1500; // ms

export function useDocument(): UseDocumentReturn {
  const [document, setDocument] = useState<Document | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDocument = useCallback(async (id: string) => {
    const response = await documentsApi.get(id);
    setDocument(response.data);
    setSaveStatus('saved');
  }, []);

  const saveDocument = useCallback(
    async (payload: UpdateDocumentPayload) => {
      if (!document) return;
      setSaveStatus('saving');
      try {
        const response = await documentsApi.update(document.id, payload);
        setDocument(response.data);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [document]
  );

  /** Debounced save — call on every editor change */
  const scheduleSave = useCallback(
    (payload: UpdateDocumentPayload) => {
      setSaveStatus('unsaved');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveDocument(payload);
      }, AUTOSAVE_DELAY);
    },
    [saveDocument]
  );

  return {
    document,
    saveStatus,
    loadDocument,
    saveDocument,
    scheduleSave,
    setDocument,
  };
}
