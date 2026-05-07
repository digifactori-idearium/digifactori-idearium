import { UserRoundCheck, UserRoundX, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { SuperButton } from '@/components/common/button';
import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { UsersList } from '@/components/profile/UsersList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/providers/UserProvider';
import { getParticularUserIdeoramas } from '@/services/ideorama.service';
import {
  followUser,
  getFollowers,
  getFollowing,
  getProfile,
} from '@/services/profile.service';

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile>({
    id: '',
    userId: '',
    pseudo: '',
    bio: '',
    avatar: null,
    voiceButtons: true,
    followers: [],
    following: [],
    ideoramaLiked: [],
    ideoramas: [],
  });
  const [ideoramas, setIdeoramas] = useState<Ideorama[]>([]);
  const [followers, setFollowers] = useState<
    { pseudo: string; avatar: string | null; userId: string }[]
  >([]);
  const [following, setFollowing] = useState<
    { pseudo: string; avatar: string | null; userId: string }[]
  >([]);

  const user = useUser().user;

  const [currentUserFollowing, setCurrentUserFollowing] = useState<string[]>(
    []
  );

  const handleFollowChange = (
    targetUserId: string,
    isNowFollowing: boolean
  ) => {
    setCurrentUserFollowing(prev =>
      isNowFollowing
        ? [...prev, targetUserId]
        : prev.filter(id => id != targetUserId)
    );

    setProfile(prev => ({
      ...prev,
      following: isNowFollowing
        ? [...prev.following, targetUserId]
        : prev.following.filter(id => id !== targetUserId),
    }));
  };

  useEffect(() => {
    if (user?.id) {
      getFollowing(user.id)
        .then(res => {
          setCurrentUserFollowing(
            (res.data.following ?? []).map((u: { userId: string }) => u.userId)
          );
        })
        .catch(err => console.error('Failed to fetch following.', err));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then(res => {
      setProfile(res.data.profile);
    });
  }, [userId]);

  useEffect(() => {
    if (profile) {
      getParticularUserIdeoramas(profile.userId).then(res => {
        setIdeoramas(res.data);
      });
    }
  }, [profile]);

  return (
    <div className="container mx-auto h-full px-32">
      <div className="flex gap-3">
        <div className="relative pb-3">
          <Avatar className="h-32 w-32 border-2 border-white/20 shadow-sm shrink-0">
            <AvatarImage
              src={
                profile?.avatar ||
                'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
              }
              alt="Profile"
            />
            <AvatarFallback>{profile?.pseudo}</AvatarFallback>
          </Avatar>
          {profile?.followers.some(f => f === user?.id) && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="h-3 w-3" /> Abonné
            </span>
          )}
        </div>
        <div className="ml-6 flex flex-col gap-4">
          <h1 className="magic-text">{profile?.pseudo}</h1>
          <p>{profile?.bio || "Cet utilisateur n'a pas de biographie."}</p>
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-center">
        <UsersList
          title={`Abonné${(profile?.followers.length || 0) > 1 ? 's' : ''}`}
          users={followers}
          trigger={
            <SuperButton
              className="text-white! bg-mauve! hover:bg-mauve/80! border-mauve!"
              disabled={(profile?.followers.length || 0) === 0}
              tooltip={
                (profile?.followers.length || 0) > 1
                  ? `Voir les abonnés de ${profile?.pseudo}`
                  : `Voir l'abonné de ${profile?.pseudo}`
              }
              onClick={() => {
                if ((profile?.followers.length || 0) === 0) return;
                getFollowers(profile!.userId).then(res => {
                  setFollowers(res.data.followers ?? []);
                });
              }}
            >
              {`${profile?.followers.length || 0} abonné${(profile?.followers.length || 0) > 1 ? 's' : ''}`}
            </SuperButton>
          }
          currentUserFollowing={currentUserFollowing}
          onFollowChange={handleFollowChange}
        />

        <UsersList
          title={`Abonnement${(profile?.following.length || 0) > 1 ? 's' : ''}`}
          users={following}
          trigger={
            <SuperButton
              className="text-white! bg-mauve! hover:bg-mauve/80! border-mauve!"
              disabled={(profile?.following.length || 0) === 0}
              tooltip={
                (profile?.following.length || 0) > 1
                  ? `Voir les abonnements de ${profile?.pseudo}`
                  : `Voir l'abonnement de ${profile?.pseudo}`
              }
              onClick={() => {
                if ((profile?.following.length || 0) === 0) return;
                getFollowing(profile!.userId).then(res => {
                  setFollowing(res.data.following ?? []);
                });
              }}
            >
              {`${profile?.following.length || 0} abonnement${(profile?.following.length || 0) > 1 ? 's' : ''}`}
            </SuperButton>
          }
          currentUserFollowing={currentUserFollowing}
          onFollowChange={handleFollowChange}
        />
        {profile.userId != user?.id && (
          <SuperButton
            className={`border! ${profile?.followers.some(f => f === user?.id) ? 'text-red-500 bg-sidebar!  border-red-500!' : 'text-white bg-green-500! hover:bg-green-500/80! border-green-500!'}`}
            tooltip={`Suivre ${profile?.pseudo}`}
            onClick={() => {
              followUser(profile!.userId);
              // If the user is already a follower, unfollow them and remove them from the followers list
              if (profile?.followers.some(f => f == user?.id)) {
                setFollowers(
                  followers.filter(f => f.pseudo !== profile?.pseudo)
                );
                setProfile({
                  ...profile,
                  followers: profile.followers.filter(f => f !== user?.id),
                });
                setCurrentUserFollowing(prev =>
                  prev.filter(id => id !== profile!.userId)
                );
              } else {
                setFollowers([
                  ...followers,
                  {
                    pseudo: profile!.pseudo,
                    avatar: profile!.avatar,
                    userId: profile!.userId,
                  },
                ]);
                setCurrentUserFollowing(prev => [...prev, profile!.userId]);
                if (profile) {
                  setProfile({
                    ...profile,
                    followers: [...profile.followers, user!.id],
                  });
                }
              }
            }}
          >
            {profile?.followers.some(f => f === user?.id) ? (
              <>
                <UserRoundX /> Se désabonner
              </>
            ) : (
              <>
                <UserRoundCheck /> S'abonner
              </>
            )}
          </SuperButton>
        )}
      </div>

      <hr className="border-gray-100 mt-8" />
      <h1 className="magic-text pb-3">Idéoramas de {profile?.pseudo}</h1>
      <IdeoramasGroup ideoramas={ideoramas} setIdeoramas={setIdeoramas} />
    </div>
  );
};

export default ProfilePage;
