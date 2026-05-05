import React, { useEffect, useState } from 'react';

import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { getAllIdeoramas } from '@/services/ideorama.service';

const Ideoramas: React.FC = () => {
  const [ideoramas, setIdeoramas] = useState<Ideorama[]>([]);

  useEffect(() => {
    getAllIdeoramas().then(res => {
      setIdeoramas(res.data);
    });
  }, []);

  return (
    <div className="w-full h-full">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Ideoramas
      </h1>

      <IdeoramasGroup ideoramas={ideoramas} setIdeoramas={setIdeoramas} />
    </div>
  );
};

export default Ideoramas;
