import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Editor } from '@/components/editor';
import { DocumentList } from '@/components/editor/DocumentList';
import { useUser } from '@/providers/UserProvider';

export const TextEditor: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <DocumentList
      userId={user.id}
      onOpen={id => navigate(`/app/text-editor/${id}`)}
    />
  );
};

export const EditorPage: React.FC = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  return (
    <Editor
      documentId={documentId!}
      onBack={() => navigate('/app/text-editor')}
    />
  );
};
