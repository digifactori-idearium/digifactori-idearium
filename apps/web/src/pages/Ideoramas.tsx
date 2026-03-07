import { House } from 'lucide-react';
import React from 'react';

import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';

const Ideoramas: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Ideoramas <House />
      </h1>

      <IdeoramasGroup />
    </div>
  );
};

export default Ideoramas;
