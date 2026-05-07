import { Clock, FileText, Trash2 } from 'lucide-react';
import React from 'react';

import { SuperButton } from '../common/button';

import DocumentDeleter from '@/components/dialog/AlertDialog';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}

interface DocumentCardProps {
  doc: DocumentListItem;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onOpen,
  onDelete,
}) => {
  return (
    <div
      className="group relative rounded-2xl border border-mauve-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
      onClick={() => onOpen(doc.id)}
    >
      {/* Color stripe */}
      <div className="h-1.5 w-full" style={{ background: doc.color }} />

      <div className="p-4">
        {/* Emoji + title */}
        <div className="flex items-start gap-2.5 mb-3">
          <span className="text-2xl shrink-0">{doc.emoji}</span>
          <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2 mt-0.5 truncate">
            {doc.title}
          </h3>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {doc.wordCount} mot{doc.wordCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(doc.updatedAt)}
          </span>
        </div>
      </div>

      {/* Delete button */}
      {doc != null && (
        <DocumentDeleter
          trigger={
            <SuperButton
              className="absolute top-3 right-3 transition-opacity flex items-center justify-center w-7 h-7 rounded-lg bg-red-400 hover:bg-red-600 text-white"
              tooltip="Supprimer le document"
              voiceText="Supprimer le document"
              onClick={e => e.stopPropagation()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </SuperButton>
          }
          description={
            <>
              Cela supprimera définitivemennnnnt le document{' '}
              <span className="font-bold text-mauve">{doc.title}</span>
            </>
          }
          confirmationMessage="Oui, supprimer"
          onConfirm={() => {
            onDelete(doc.id);
          }}
          onCancel={() => {}}
        />
      )}
    </div>
  );
};
