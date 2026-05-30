import React from 'react';

const TextEditor: React.FC = () => {
  return (
    <div className="w-full h-full">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Editeur audio
      </h1>
      <h3 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        En construction...{' '}
      </h3>
      <p className="mx-auto text-9xl">🏗️ </p>
    </div>
  );
};

export default TextEditor;
