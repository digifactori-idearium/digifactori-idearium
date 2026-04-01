import React from 'react';
import { Link } from 'react-router-dom';

interface ProfileCardProps {
  title: string;
  link: string;
  imageSrc: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ title, link, imageSrc }) => {
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 dark:border-white/20 group-hover:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-107">
      <Link
        to={link}
        className="absolute top-0 left-0 w-full h-3/4 overflow-hidden "
      >
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="absolute bottom-0 left-0 w-full h-1/4 flex items-center justify-center">
        <h2 className="magic-text text-2xl font-bold text-center">{title}</h2>
      </div>
    </div>
  );
};

export default ProfileCard;
