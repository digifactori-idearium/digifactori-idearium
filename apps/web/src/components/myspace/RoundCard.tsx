import { CirclePlus } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { SuperButton } from '@/components/global';
interface RoundCardProps {
  title: string;
  link: string;
  imageSrc: string;
  onActionClick: () => void;
  toolTip: string;
}

const RoundCard: React.FC<RoundCardProps> = ({
  title,
  link,
  imageSrc,
  onActionClick,
  toolTip,
}) => {
  return (
    <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 dark:border-white/20 group-hover:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-107">
      <Link
        to={link}
        className="absolute top-0 left-0 w-full h-3/4 overflow-hidden "
      >
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <h2 className="bg-black/10 rounded-full text-white text-xl font-bold text-center">
            {title}
          </h2>
        </div>
      </Link>

      <div className="absolute bottom-0 left-0 w-full h-1/4 flex items-center justify-center">
        <SuperButton
          tooltip={toolTip}
          voiceText={toolTip}
          className="main-btn px-4 py-2 rounded-full"
          onClick={e => {
            e.preventDefault();
            onActionClick();
          }}
        >
          <CirclePlus />
        </SuperButton>
      </div>
    </div>
  );
};

export default RoundCard;
