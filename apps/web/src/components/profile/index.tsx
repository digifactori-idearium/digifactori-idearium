import { Loader2, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ChangePasswordDialog } from '../auth/Change';

import AdvancedSettingsDialog from './AdvancedSettingsDialog';
import AvatarSelector from './AvatarSelector';
import ProfileForm from './ProfileForm';
import ProfileHeader from './ProfileHeader';

import { VoiceButton } from '@/components/common/button';
import { useProfile } from '@/hooks/useProfile';

const AVATAR_OPTIONS = [
  { id: 1, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noah' },
  { id: 2, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 3, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma' },
  { id: 4, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie' },
  { id: 5, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lily' },
  { id: 6, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emery' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, updateUserProfile, removeProfile, loading } =
    useProfile();

  const [acc, setAcc] = useState<{
    profile: any;
    user: any;
  } | null>(null);

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

  const handleUpdate = async (userData: any, profileData: any) => {
    await updateUserProfile(userData, profileData);

    setAcc(prev => {
      if (!prev) return null;

      return {
        ...prev,
        user: {
          ...prev.user,
          ...userData,
        },
        profile: {
          ...prev.profile,
          ...profileData,
        },
      };
    });
  };

  const handleDelete = async () => {
    await removeProfile();
    navigate('/login');
  };

  const handleProfileSubmit = async (data: any) => {
    const profileData = { ...data, avatar: acc.profile?.avatar };

    await updateUserProfile(acc.user, profileData);
    setAcc(prev =>
      prev
        ? {
            ...prev,
            profile: { ...prev.profile, ...data },
          }
        : prev
    );
  };

  return (
    <div className="w-full">
      <ProfileHeader>
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <AdvancedSettingsDialog
            user={acc.user}
            profile={acc.profile}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          >
            <VoiceButton
              voiceText={"Le paramètre avancé, c'est pour les grands."}
              className="flex items-center gap-2 form-button"
            >
              <Lock className="w-4 h-4" />
              Paramètres avancés
            </VoiceButton>
          </AdvancedSettingsDialog>
          <ChangePasswordDialog />
        </div>
      </ProfileHeader>

      <div className="h-full w-full flex md:flex-row flex-col justify-center items-center md:gap-8 gap-4 mt-8">
        <AvatarSelector
          avatar={acc.profile.avatar || AVATAR_OPTIONS[0].url}
          pseudo={acc.profile.pseudo}
          options={AVATAR_OPTIONS}
          onSelect={url =>
            setAcc(prev =>
              prev
                ? {
                    ...prev,
                    profile: { ...prev.profile, avatar: url },
                  }
                : prev
            )
          }
        />

        <ProfileForm
          initialValues={{
            pseudo: acc.profile.pseudo || '',
            bio: acc.profile.bio || '',
            avatar: acc.profile.avatar || AVATAR_OPTIONS[0].url,
          }}
          onSubmit={handleProfileSubmit}
        />
      </div>
    </div>
  );
};

export default Profile;
