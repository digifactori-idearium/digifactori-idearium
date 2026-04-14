import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { DocumentCard } from './DocumentCard';
import { EditorCreator } from './EditorCreator';

import { Loading } from '@/components/common';
import { useDocumentList } from '@/hooks/editor';

interface DocumentListProps {
  userId: string;
  onOpen: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  userId,
  onOpen,
}) => {
  const { documents, loading, fetchDocuments, deleteDocument } =
    useDocumentList();

  useEffect(() => {
    fetchDocuments();
  }, [userId, fetchDocuments]);

  const [createsNew, setCreatesNew] = useState(false);

  return (
    <div className="h-full w-full p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black magic-text">Mes documents</h1>
          <p className="text-slate-500 text-sm mt-1">
            {documents.length === 0
              ? 'Crée ton premier document !'
              : `${documents.length} document${documents.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setCreatesNew(true)}
          className="
            flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white
            bg-linear-to-r from-violet-500 to-pink-500
            hover:scale-105
            transition-all duration-200 text-sm
          "
        >
          <Plus className="w-4 h-4" />
          Nouveau document
        </button>
      </div>

      {/* Grid */}
      <div className="p-2">
        {loading ? (
          <Loading />
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-bold mb-2">
              Aucun document pour l'instant
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Clique sur « Nouveau document » pour commencer à écrire !
            </p>
            <button
              onClick={() => setCreatesNew(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-linear-to-r from-violet-500 to-pink-500  hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer un document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onOpen={onOpen}
                onDelete={deleteDocument}
              />
            ))}
          </div>
        )}
      </div>
      {createsNew && (
        <EditorCreator
          isOpen={createsNew}
          setIsOpen={setCreatesNew}
          userId={userId}
          onOpen={onOpen}
        />
      )}
    </div>
  );
};
