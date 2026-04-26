import { House } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { getPublicIdeoramas } from '@/services/ideorama.service';

const Ideoramas: React.FC = () => {
  const [ideoramas, setIdeoramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeoramas = async () => {
      try {
        const response = await getPublicIdeoramas();
        setIdeoramas(response.data);
      } catch (error) {
        console.error('Erreur explorer public:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeoramas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement des idéoramas...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Ideoramas <House />
      </h1>

      <IdeoramasGroup
        ideoramas={ideoramas}
        profile={{}}
        setIdeoramas={setIdeoramas}
      />
    </div>
  );
};

export default Ideoramas;