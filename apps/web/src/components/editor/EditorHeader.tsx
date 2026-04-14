import { ArrowLeft, Pencil } from 'lucide-react';
import React, { useState } from 'react';

import { SaveStatus } from './SaveStatus';

import { EMOJIS, COLORS } from '@/lib/editor';

interface EditorHeaderProps {
  document: Document;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  wordCount: number;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onEmojiChange: (emoji: string) => void;
  onColorChange: (color: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  document,
  saveStatus,
  wordCount,
  onBack,
  onTitleChange,
  onEmojiChange,
  onColorChange,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(document.title);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commitTitle = () => {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue !== document.title) {
      onTitleChange(titleValue.trim());
    }
  };

  return (
    <header className="flex items-center gap-3 px-4 py-1 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
        title="Retour"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Emoji + color */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(p => !p)}
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
          title="Changer l'icône"
        >
          {document.emoji}
        </button>
        {showEmojiPicker && (
          <div className="absolute top-12 left-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-3 flex flex-col gap-2 min-w-max">
            <div className="flex gap-1.5 flex-wrap max-w-50">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => {
                    onEmojiChange(e);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:scale-110 transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    onColorChange(c);
                    setShowEmojiPicker(false);
                  }}
                  style={{ background: c }}
                  className="w-6 h-6 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => e.key === 'Enter' && commitTitle()}
            maxLength={60}
            className="w-full text-lg font-bold text-slate-800 bg-violet-50 border-b-2 border-violet-400 outline-none px-1 rounded-sm"
            placeholder="Titre de ton document…"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="group flex items-center gap-1.5 text-left max-w-full"
          >
            <span className="text-lg font-bold text-slate-800 truncate">
              {document.title}
            </span>
            <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
        <span>
          {wordCount} mot{wordCount !== 1 ? 's' : ''}
        </span>
        <SaveStatus status={saveStatus} />
      </div>
    </header>
  );
};
