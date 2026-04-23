import { EditorContent } from '@tiptap/react';
import React, { useEffect, useCallback, useRef } from 'react';

import { EditorHeader } from './EditorHeader';
import { EditorToolbar } from './EditorToolbar';

import { Loading } from '@/components/common';
import { useTipTapEditor, useDocument } from '@/hooks/editor';

interface TextEditorrProps {
  documentId: string;
  onBack: () => void;
}

export const Editor: React.FC<TextEditorrProps> = ({ documentId, onBack }) => {
  const { document, saveStatus, loadDocument, scheduleSave, setDocument } =
    useDocument();

  const seededRef = useRef<string | null>(null);

  useEffect(() => {
    loadDocument(documentId);
    seededRef.current = null;
  }, [documentId, loadDocument]);

  const handleUpdate = useCallback(
    (html: string, json: Record<string, unknown>) => {
      scheduleSave({ content: html, json });
    },
    [scheduleSave]
  );

  const editor = useTipTapEditor({
    content: '',
    onUpdate: handleUpdate,
  });

  useEffect(() => {
    if (
      editor &&
      document?.content !== undefined &&
      seededRef.current !== document.id
    ) {
      seededRef.current = document.id;
      editor.commands.setContent(document.content ?? '', { emitUpdate: false });
    }
  }, [editor, document?.id, document?.content]);

  const wordCount =
    editor?.storage.characterCount?.words() ?? document?.wordCount ?? 0;

  if (!document) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-violet-50 via-pink-50 to-sky-50">
      <EditorHeader
        document={document}
        saveStatus={saveStatus}
        wordCount={wordCount}
        onBack={onBack}
        onTitleChange={title => {
          setDocument(d => (d ? { ...d, title } : d));
          scheduleSave({ title });
        }}
        onEmojiChange={emoji => {
          setDocument(d => (d ? { ...d, emoji } : d));
          scheduleSave({ emoji });
        }}
        onColorChange={color => {
          setDocument(d => (d ? { ...d, color } : d));
          scheduleSave({ color });
        }}
      />

      {editor && <EditorToolbar editor={editor} />}

      <div className="flex-1">
        <div className="max-w-3xl mx-auto p-4">
          <div className="min-h-120 bg-white/90 rounded-3xl shadow-xl shadow-slate-200/50 p-4 border border-white text-editor-content z-40 overflow-y-auto overflow-x-hidden">
            {editor ? (
              <EditorContent editor={editor} className="outline-none z-40" />
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>

      <div className="fixed top-20 right-8 w-16 h-16 bg-pink-200/30 rounded-full blur-xl pointer-events-none" />
      <div className="fixed bottom-16 left-8 w-20 h-20 bg-violet-200/30 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};
