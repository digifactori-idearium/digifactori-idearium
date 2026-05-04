import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { SuperButton } from '@/components/common/button';
import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/providers/UserProvider';
import { getAllIdeoramas } from '@/services/ideorama.service';
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
    { pseudo: string; avatar: string | null }[]
  >([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [following, setFollowing] = useState<
    { pseudo: string; avatar: string | null }[]
  >([]);
  const [showFollowing, setShowFollowing] = useState(false);

  const user = useUser().user;

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then(res => {
      setProfile(res.data.profile);
      console.log(res.data.profile);
    });
  }, [userId]);

  useEffect(() => {
    if (profile) {
      getAllIdeoramas().then(res => {
        setIdeoramas(res.data);
      });
    }
  }, [profile]);

  return (
    <div>
      <p>{profile?.pseudo}</p>
      <p>{profile?.bio}</p>
      <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
        <AvatarImage
          src={
            profile?.avatar ||
            'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
          }
          alt="Profile"
        />
        <AvatarFallback>{profile?.pseudo}</AvatarFallback>
      </Avatar>
      <SuperButton
        tooltip={`Voir les followers de ${profile?.pseudo}`}
        onClick={() => {
          if (showFollowers) {
            setShowFollowers(false);
            setFollowers([]);
            return;
          }
          setShowFollowers(true);
          getFollowers(profile!.userId).then(res => {
            setFollowers(res.data.followers);
          });
        }}
      >
        Followers: {profile?.followers.length || 0}
      </SuperButton>
      <SuperButton
        tooltip={`Voir les utilisateurs suivis par ${profile?.pseudo}`}
        onClick={() => {
          if (showFollowing) {
            setShowFollowing(false);
            setFollowing([]);
            return;
          }
          setShowFollowing(true);
          getFollowing(profile!.userId).then(res => {
            setFollowing(res.data.following);
          });
        }}
      >
        Following: {profile?.following.length || 0}
      </SuperButton>
      {profile.userId != user?.id && (
        <SuperButton
          tooltip={`Follow ${profile?.pseudo}`}
          onClick={() => {
            followUser(profile!.userId);
            // If the user is already a follower, unfollow them and remove them from the followers list
            if (profile?.followers.some(f => f == user?.id)) {
              setFollowers(followers.filter(f => f.pseudo != profile?.pseudo));
              setProfile({
                ...profile,
                followers: profile.followers.filter(f => f != user?.id),
              });
            } else {
              setFollowers([
                ...followers,
                { pseudo: profile!.pseudo, avatar: profile!.avatar },
              ]);
              if (profile) {
                setProfile({
                  ...profile,
                  followers: [...profile.followers, user!.id],
                });
              }
            }
          }}
        >
          {profile?.followers.some(f => f === user?.id) ? 'Unfollow' : 'Follow'}{' '}
          {profile?.pseudo}
        </SuperButton>
      )}
      <div>
        Followers:
        {showFollowers &&
          followers.map((follower, index) => (
            <div key={index}>
              <p>{follower.pseudo}</p>
              <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
                <AvatarImage
                  src={
                    follower.avatar ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                  }
                  alt="Profile"
                />
                <AvatarFallback>{follower.pseudo}</AvatarFallback>
              </Avatar>
            </div>
          ))}
      </div>
      <div>
        Following:
        {showFollowing &&
          following.map((followed, index) => (
            <div key={index}>
              <p>{followed.pseudo}</p>
              <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
                <AvatarImage
                  src={
                    followed.avatar ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                  }
                  alt="Profile"
                />
                <AvatarFallback>{followed.pseudo}</AvatarFallback>
              </Avatar>
            </div>
          ))}
      </div>
      Idéoramas de {profile?.pseudo}:
      <IdeoramasGroup
        ideoramas={ideoramas}
        setIdeoramas={setIdeoramas}
        profile={profile}
        setProfile={setProfile}
      />
    </div>
  );
};

export default ProfilePage;
