import React, { useState } from 'react';

import { Editor } from '@/components/editor';
import { DocumentList } from '@/components/editor/DocumentList';
import { useUser } from '@/providers/UserProvider';

type View = { type: 'list' } | { type: 'editor'; documentId: string };

const TextEditor: React.FC = () => {
  const [view, setView] = useState<View>({ type: 'list' });
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {view.type === 'list' ? (
        <DocumentList
          userId={user.id}
          onOpen={id => setView({ type: 'editor', documentId: id })}
        />
      ) : (
        <Editor
          documentId={view.documentId}
          onBack={() => setView({ type: 'list' })}
        />
      )}
    </div>
  );
};

export default TextEditor;
