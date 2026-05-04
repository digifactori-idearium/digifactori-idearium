import { Wand } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { SuperButton } from '@/components/common/button';
import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { getUserIdeoramas } from '@/services/ideorama.service';
import { getMyProfile } from '@/services/profile.service';

const MyIdeoramas: React.FC = () => {
  const [ideoramas, setIdeoramas] = useState<Ideorama[]>([]);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    userId: '',
    pseudo: 'Unknown',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    bio: '',
    followers: [],
    following: [],
    ideoramaLiked: [],
    ideoramas: [],
  });

  const [createsNew, setCreatesNew] = useState(false);

  useEffect(() => {
    getUserIdeoramas().then(res => {
      setIdeoramas(res.data);
    });
    getMyProfile().then(res => {
      setProfile(res.data.profile);
    });
  }, []);

  return (
    <div className="w-full h-full">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Tes idéoramas, {profile.pseudo}
      </div>
      <SuperButton
        tooltip="Créer un nouveau idéorama"
        voiceText="Créer un nouveau idéorama"
        onClick={() => setCreatesNew(true)}
        className="main-btn mb-8"
      >
        <Wand /> Créer un nouveau idéorama
      </SuperButton>
      {createsNew && (
        <IdeoramaCreator isOpen={createsNew} setIsOpen={setCreatesNew} />
      )}
      <IdeoramasGroup ideoramas={ideoramas} setIdeoramas={setIdeoramas} />
    </div>
  );
};

export default MyIdeoramas;
