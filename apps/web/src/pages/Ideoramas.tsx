import { House } from 'lucide-react';
import React from 'react';

import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';

const Ideoramas: React.FC = () => {
  const ideoramas = [
    {
      name: 'Mystical Blue Swirl',
      image:
        'https://cdn.shadcnstudio.com/ss-assets/components/card/image-7.png?width=368&format=auto',
      likes: 30,
      ownerName: 'Noah',
      ownerAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noah',
    },
    {
      name: 'Fiery Sunset Gradient',
      image:
        'https://cdn.shadcnstudio.com/ss-assets/components/card/image-4.png?width=368&format=auto',
      likes: 100,
      ownerName: 'Felix',
      ownerAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    },
    {
      name: 'Cosmic Blue Waves',
      image:
        'https://cdn.shadcnstudio.com/ss-assets/components/card/image-5.png?width=368&format=auto',
      likes: 1082,
      ownerName: 'Emma',
      ownerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma',
    },
  ];

  const testIdeoramas = Array(8).fill(ideoramas).flat();

  return (
    <div className="min-h-screen p-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Ideoramas <House />
      </h1>

      <IdeoramasGroup
        ideoramas={testIdeoramas}
        profile={{
          pseudo: 'RobLaMenace',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
        }}
        setIdeoramas={() => {}}
        setProfile={() => {}}
      />
    </div>
  );
};

export default Ideoramas;
