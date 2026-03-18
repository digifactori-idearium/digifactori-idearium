import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import RoundCard from '@/components/myspace/RoundCard';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
const MySpace: React.FC = () => {
  const { fetchProfile, loading } = useProfile();

  const [acc, setAcc] = useState<{
    profile: any;
    user: any;
  } | null>(null);

  const [createsNew, setCreatesNew] = useState(false);

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

  return (
    <div className="w-full min-h-screen p-6 flex flex-col relative ">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-4 font-bold">
        Espace de {acc.profile.pseudo}{' '}
        <Avatar className="h-[1em] w-[1em] border-2 border-white/20">
          <AvatarImage
            src={acc.profile.avatar}
            alt="Profile Picture"
            className="object-cover"
          />
        </Avatar>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 max-w-4xl mx-auto z-1 place-items-center">
        <RoundCard
          title="Mes Idéoramas"
          link="/app/myIdeoramas"
          imageSrc="https://rooms.xyz/honeycomb-v2.webp"
          onActionClick={() => setCreatesNew(true)}
          toolTip="Créer un idéorama"
        />
        <RoundCard
          title="Mes Modèles"
          link="/app/voxel"
          imageSrc="https://techcrunch.com/wp-content/uploads/2023/05/Screenshot-2023-05-15-at-3.08.50-PM.jpg?w=680"
          onActionClick={() => {}}
          toolTip="Créer un modèle"
        />
        <RoundCard
          title="Mon éditeur de texte"
          link="/app/text-editor"
          imageSrc="https://collegeinfogeek.com/wp-content/uploads/2018/11/Essential-Books.jpg"
          onActionClick={() => {}}
          toolTip="Écrire un nouveau texte"
        />
        <RoundCard
          title="Mon éditeur audio"
          link="/app/audio-editor"
          imageSrc="https://images.newscientist.com/wp-content/uploads/2018/08/07151255/gettyimages-937069350.jpg"
          onActionClick={() => {}}
          toolTip="Créer un nouvel audio"
        />

        {createsNew && (
          <IdeoramaCreator
            isOpen={createsNew}
            setIsOpen={setCreatesNew}
            userId={acc.user?.id}
          />
        )}
      </div>
    </div>
  );
};

export default MySpace;
