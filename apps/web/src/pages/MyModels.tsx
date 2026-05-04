import { Wand } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Loading } from '@/components/common';
import { SuperButton } from '@/components/common/button';
import { VoxelModelCreator } from '@/components/voxel/VoxelModelCreator';
import VoxelModelsGroup from '@/components/voxel/VoxelModelsGroup';
import { useProfile } from '@/hooks/useProfile';
import { getUserVoxelModels, VoxelModel } from '@/services/voxel.service';

const MyModels: React.FC = () => {
  const { fetchProfile, loading } = useProfile();

  const [models, setModels] = useState<VoxelModel[]>([]);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    userId: '',
    pseudo: 'Unknown',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma',
    bio: '',
    followers: [],
    following: [],
    ideoramaLiked: [],
    ideoramas: [],
  });

  const [createsNew, setCreatesNew] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      const [profileData, modelsData] = await Promise.all([
        fetchProfile(),
        getUserVoxelModels(),
      ]);

      setProfile(profileData.profile);
      setModels(modelsData.data);
    };

    loadPage().catch(() => {});
  }, [fetchProfile]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Tes modèles, {profile.pseudo}
      </div>

      <SuperButton
        tooltip="Créer un nouveau modèle"
        voiceText="Créer un nouveau modèle"
        onClick={() => setCreatesNew(true)}
        className="main-btn mb-8"
      >
        <Wand /> Créer un nouveau modèle
      </SuperButton>

      {createsNew && (
        <VoxelModelCreator isOpen={createsNew} setIsOpen={setCreatesNew} />
      )}

      <VoxelModelsGroup
        models={models}
        profile={profile}
        setModels={setModels}
      />
    </div>
  );
};

export default MyModels;
