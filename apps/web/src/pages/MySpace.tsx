import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import ProfileCard from '@/components/myspace/ProfileCard';
import RoundCard from '@/components/myspace/RoundCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselReset,
} from '@/components/ui/carousel';
import { CircularImage } from '@/components/ui/CircularImage';
import { useProfile } from '@/hooks/useProfile';

const MySpace: React.FC = () => {
  const { fetchProfile, loading } = useProfile();

  const [acc, setAcc] = useState<{
    profile: any;
    user: any;
  } | null>(null);

  const [createsNew, setCreatesNew] = useState(false);

  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setAcc(data);
      } catch {
        /* handled in hook */
      }
    };
    loadProfile();
  }, [fetchProfile]);

  if (!acc || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        Loading...
      </div>
    );
  }
  const Images = [
    {
      path: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'image1',
    },
    {
      path: 'https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'image2',
    },
    {
      path: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'image3',
    },
  ];

  const roundCards = [
    {
      title: 'Mes Idéoramas',
      link: '/app/my-ideoramas',
      imageSrc: 'https://rooms.xyz/honeycomb-v2.webp',
      onActionClick: () => setCreatesNew(true),
      toolTip: 'Créer un nouveau idéorama',
    },
    {
      title: 'Mes Modèles',
      link: '/app/voxel',
      imageSrc:
        'https://techcrunch.com/wp-content/uploads/2023/05/Screenshot-2023-05-15-at-3.08.50-PM.jpg?w=680',
      onActionClick: () => {},
      toolTip: 'Créer un nouveau modèle',
    },
    {
      title: 'Mes idées',
      link: '/app/my-ideas',
      imageSrc:
        'https://npr.brightspotcdn.com/dims4/default/9d2fef6/2147483647/strip/true/crop/500x498+0+0/resize/880x876!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Flegacy%2Fsites%2Fkut%2Ffiles%2F201312%2Funleash-creativity.jpg',
      onActionClick: () => {},
      toolTip: 'Créer une nouvelle idée',
    },
    {
      title: 'Mon éditeur de texte',
      link: '/app/text-editor',
      imageSrc:
        'https://collegeinfogeek.com/wp-content/uploads/2018/11/Essential-Books.jpg',
      onActionClick: () => {},
      toolTip: 'Créer un nouveau texte',
    },
    {
      title: 'Mon éditeur audio',
      link: '/app/audio-editor',
      imageSrc:
        'https://images.newscientist.com/wp-content/uploads/2018/08/07151255/gettyimages-937069350.jpg',
      onActionClick: () => {},
      toolTip: 'Créer un nouvel audio',
    },
  ];

  const radius = 260;
  const totalCards = roundCards.length;

  return (
    <div className="w-full min-h-screen pt-40 p-6 flex items-start justify-center relative overflow-hidden">
      {bgImage && (
        <div
          className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out bg-cover bg-center scale-110 blur-md"
          style={{
            backgroundImage: bgImage
              ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})`
              : 'none',
            backgroundColor: bgImage ? 'transparent' : '#f3f4f6',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center">
        <Carousel
          orientation="vertical"
          className="max-w-md h-[400px] flex flex-col items-center justify-center overflow-visible"
        >
          <div className="flex justify-center w-full mb-2">
            <CarouselPrevious className="ml-8 static translate-y-0 rotate-90 hover:bg-gray-100 shrink-0" />
          </div>
          <CarouselContent className="h-[200px] w-full overflow-visible">
            {Images.map((bgimage, index) => (
              <CarouselItem className="flex justify-center items-center overflow-visible">
                <CircularImage
                  key={index}
                  src={bgimage.path}
                  alt={bgimage.alt}
                  onClick={() => setBgImage(bgimage.path)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="ml-12 flex justify-center items-center  w-full ">
            <CarouselNext className="static translate-y-0 rotate-90 hover:bg-gray-100 shrink-0" />
            <button
              onClick={() => setBgImage('')}
              className={bgImage ? 'visible' : 'invisible'}
            >
              <CarouselReset className="static translate-y-0 rotate-90 hover:bg-gray-100 shrink-0" />
            </button>
          </div>
        </Carousel>
      </div>

      <div className="relative flex items-center justify-center w-full h-[530px]">
        <ProfileCard
          title={acc.profile.pseudo}
          link="/app/profile"
          imageSrc={acc.profile.avatar}
        />
        {roundCards.map((card, index) => {
          const angle = index * (360 / totalCards) * (Math.PI / 180) - 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={card.title}
              className="absolute transition-transform duration-500 hover:scale-105"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <RoundCard
                title={card.title}
                link={card.link}
                imageSrc={card.imageSrc}
                onActionClick={card.onActionClick}
                toolTip={card.toolTip}
              />
            </div>
          );
        })}
      </div>
      {createsNew && (
        <IdeoramaCreator
          isOpen={createsNew}
          setIsOpen={setCreatesNew}
          userId={acc.user?.id}
        />
      )}
    </div>
  );
};

export default MySpace;
