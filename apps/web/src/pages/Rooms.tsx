import { House } from 'lucide-react';
import React from 'react';

import RoomsGroup from '@/components/rooms/RoomsGroup';

const Rooms: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Rooms <House />
      </h1>

      <RoomsGroup />
    </div>
  );
};

export default Rooms;
