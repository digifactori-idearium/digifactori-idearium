import {
  UserRoundCheck,
  UserRoundX,
  Check,
  Star,
  Sparkles,
  Users,
  PartyPopper,
  Palette,
  Sprout,
  CogIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SuperButton } from '@/components/common/button';
import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { UsersList } from '@/components/profile/UsersList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/providers/UserProvider';
import { getParticularUserIdeoramas } from '@/services/ideorama.service';
import {
  followUser,
  getFollowers,
  getFollowing,
  getProfile,
} from '@/services/profile.service';

const animations = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800&display=swap');

  @keyframes spin-ring {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bounceIn {
    0%   { opacity: 0; transform: scale(0.78) translateY(20px); }
    60%  { opacity: 1; transform: scale(1.04) translateY(-5px); }
    80%  { transform: scale(0.97) translateY(2px); }
    100% { transform: scale(1) translateY(0); }
  }
  @keyframes wiggle {
    0%,100% { transform: rotate(-2.5deg); }
    50%     { transform: rotate(2.5deg);  }
  }
  @keyframes starPulse {
    0%,100% { transform: scale(1);   opacity: 1; }
    50%     { transform: scale(1.4); opacity: .65; }
  }
  @keyframes floatUp {
    0%   { transform: translateY(0)     scale(1);   opacity: .6; }
    100% { transform: translateY(-80px) scale(.5);  opacity: 0;  }
  }
  .spin-ring  { animation: spin-ring  8s linear infinite; }
  .bounce-in  { animation: bounceIn   .55s cubic-bezier(.36,.07,.19,.97) both; }
  .star-pulse { animation: starPulse  1.8s ease-in-out infinite; }
  .dot        { animation: floatUp var(--dur,3s) ease-in infinite; animation-delay: var(--delay,0s); }
  .kid-btn:hover { animation: wiggle .35s ease-in-out 2; }
`;

const Dot = ({
  color,
  size,
  left,
  top,
  dur,
  delay,
}: {
  color: string;
  size: number;
  left: string;
  top: string;
  dur: string;
  delay: string;
}) => (
  <span
    className="dot absolute rounded-full pointer-events-none z-0"
    style={
      {
        background: color,
        width: size,
        height: size,
        left,
        top,
        '--dur': dur,
        '--delay': delay,
      } as React.CSSProperties
    }
  />
);

const IdeoCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`p-0.75 rounded-[28px] bg-linear-to-br from-[#fb923c] via-mauve to-[#34d399] ${className}`}
  >
    <div className="rounded-[26px] bg-sidebar h-full w-full">{children}</div>
  </div>
);

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const user = useUser().user;
  const navigate = useNavigate();

  const { fetchProfile } = useProfile();
  const [myProfile, setMyProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(data => setMyProfile(data.profile))
      .catch(() => {});
  }, [fetchProfile]);

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
        : prev.filter(id => id !== targetUserId)
    );
  };

  useEffect(() => {
    if (user?.id) {
      getFollowing(user.id)
        .then(res =>
          setCurrentUserFollowing(
            (res.data.following ?? []).map((u: { userId: string }) => u.userId)
          )
        )
        .catch(err => console.error('Failed to fetch following.', err));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then(res => setProfile(res.data.profile));
  }, [userId]);

  useEffect(() => {
    if (profile.userId)
      getParticularUserIdeoramas(profile.userId).then(res =>
        setIdeoramas(res.data)
      );
  }, [profile.userId]);

  const isFollowing = profile.followers.some(f => f === user?.id);
  const followerCount = profile.followers.length;
  const followingCount = profile.following.length;

  const handleFollowClick = () => {
    followUser(profile.userId);

    if (isFollowing) {
      setFollowers(prev => prev.filter(f => f.userId !== user?.id));
      setProfile(prev => ({
        ...prev,
        followers: prev.followers.filter(f => f !== user?.id),
      }));
      setCurrentUserFollowing(prev => prev.filter(id => id !== profile.userId));
    } else {
      setFollowers(prev => [
        ...prev,
        {
          pseudo: myProfile?.pseudo ?? '',
          avatar: myProfile?.avatar ?? null,
          userId: user!.id,
        },
      ]);
      setProfile(prev => ({
        ...prev,
        followers: [...prev.followers, user!.id],
      }));
      setCurrentUserFollowing(prev => [...prev, profile.userId]);
    }
  };

  return (
    <>
      <style>{animations}</style>

      <div
        className="relative min-h-screen bg-transparent overflow-x-hidden px-4 py-8 md:px-12 lg:px-24"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Ambient glow blobs */}
        <div
          className="pointer-events-none fixed top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl -z-10"
          style={{
            background: 'radial-gradient(circle, #fbbf24, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none fixed bottom-0 left-0 w-60 h-60 rounded-full opacity-15 blur-3xl -z-10"
          style={{
            background:
              'radial-gradient(circle, var(--mauve), transparent 70%)',
          }}
        />

        {/* Floating dots */}
        <Dot
          color="#fbbf24"
          size={14}
          left="8%"
          top="12%"
          dur="4s"
          delay="0s"
        />
        <Dot
          color="#a78bfa"
          size={10}
          left="20%"
          top="30%"
          dur="3.2s"
          delay=".7s"
        />
        <Dot
          color="#34d399"
          size={16}
          left="75%"
          top="8%"
          dur="5s"
          delay=".3s"
        />
        <Dot
          color="#f87171"
          size={10}
          left="88%"
          top="22%"
          dur="3.8s"
          delay="1.1s"
        />
        <Dot
          color="#60a5fa"
          size={12}
          left="60%"
          top="15%"
          dur="4.5s"
          delay=".5s"
        />
        <Dot
          color="#fb923c"
          size={8}
          left="45%"
          top="5%"
          dur="3s"
          delay="1.5s"
        />

        {/* Profile card */}
        <IdeoCard className="bounce-in mx-auto max-w-2xl mb-6 relative z-10">
          {profile.userId === user?.id && (
            <SuperButton
              voiceText="Changer mes informations"
              className="absolute top-3 right-3 main-btn rounded-2xl text-xs flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => navigate('/app/profile')}
            >
              <CogIcon /> Paramètres
            </SuperButton>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <span className="spin-ring absolute -inset-1.5 rounded-full border-4 border-dashed border-[#fb923c]" />
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-sidebar shadow-xl">
                <AvatarImage
                  src={
                    profile.avatar ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
                  }
                  alt="Photo de profil"
                />
                <AvatarFallback
                  className="text-2xl font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #fb923c, var(--mauve))',
                  }}
                >
                  {profile.pseudo?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {isFollowing && (
                <span
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap
                             flex items-center gap-1 px-3 py-0.5 rounded-full text-white text-xs shadow-lg"
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    background: 'linear-gradient(135deg,#34d399,#059669)',
                  }}
                >
                  <Check className="h-3 w-3" /> Abonné·e !
                </span>
              )}
            </div>

            {/* Name & Bio */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-400 star-pulse" />
                <h1
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: 'clamp(1.8rem,5vw,2.6rem)',
                    background: 'linear-gradient(90deg,#fb923c,var(--mauve))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.1,
                  }}
                >
                  {profile.pseudo || 'Chargement…'}
                </h1>
                <Star
                  className="h-5 w-5 text-yellow-400 star-pulse"
                  style={{ animationDelay: '.6s' }}
                />
              </div>

              <p
                className="leading-relaxed font-semibold text-base"
                style={{ color: 'var(--bg-light)', opacity: 0.7 }}
              >
                {profile.bio || 'Cet explorateur est encore mystérieux… 🔮'}
              </p>
            </div>
          </div>
        </IdeoCard>

        {/* Stats and follow  */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
          {/* Followers pill */}
          <UsersList
            title={`Abonné${followerCount > 1 ? 's' : ''}`}
            users={followers}
            trigger={
              <button
                className="kid-btn inline-flex items-center gap-2 rounded-full px-5 py-2
           border-2 border-yellow-500 bg-yellow-400/10 text-yellow-600
           transition-all duration-150 disabled:opacity-50 disabled:cursor-default
           hover:bg-yellow-400/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-400/20
           dark:border-yellow-400 dark:text-yellow-300"
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1.05rem',
                }}
                disabled={followerCount === 0}
                onClick={() => {
                  if (followerCount === 0) return;
                  getFollowers(profile.userId).then(res =>
                    setFollowers(res.data.followers ?? [])
                  );
                }}
              >
                <Users className="h-4 w-4" />
                {followerCount} abonné{followerCount > 1 ? 's' : ''}
              </button>
            }
            currentUserFollowing={currentUserFollowing}
            onFollowChange={handleFollowChange}
          />

          {/* Following pill */}
          <UsersList
            title={`Abonnement${followingCount > 1 ? 's' : ''}`}
            users={following}
            trigger={
              <button
                className="kid-btn inline-flex items-center gap-2 rounded-full px-5 py-2
                           border-2 border-mauve bg-mauve/10
                           transition-all duration-150 disabled:opacity-50 disabled:cursor-default
                           hover:bg-mauve/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-(--mauve)/30"
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: '1.05rem',
                  color: 'var(--bg-light)',
                }}
                disabled={followingCount === 0}
                onClick={() => {
                  if (followingCount === 0) return;
                  getFollowing(profile.userId).then(res =>
                    setFollowing(res.data.following ?? [])
                  );
                }}
              >
                <Star className="h-4 w-4" />
                {followingCount} abonnement{followingCount > 1 ? 's' : ''}
              </button>
            }
            currentUserFollowing={currentUserFollowing}
            onFollowChange={handleFollowChange}
          />

          {/* Follow / Unfollow  */}
          {profile.userId !== user?.id && (
            <button
              className={`kid-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 border-2
                         transition-all duration-150 hover:-translate-y-0.5 hover:scale-105
                         ${
                           isFollowing
                             ? 'border-red-400 bg-red-400/10 text-red-400 hover:shadow-lg hover:shadow-red-400/20'
                             : 'border-[#34d399] text-white hover:shadow-lg hover:shadow-[#34d399]/30'
                         }`}
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1.05rem',
                ...(!isFollowing
                  ? { background: 'linear-gradient(135deg,#34d399,#059669)' }
                  : {}),
              }}
              onClick={handleFollowClick}
            >
              {isFollowing ? (
                <>
                  <UserRoundX className="h-5 w-5" /> Se désabonner
                </>
              ) : (
                <>
                  <UserRoundCheck className="h-5 w-5" /> Suivre !{' '}
                  <PartyPopper className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* divider */}
        <div
          className="h-1 rounded-full my-8 relative z-10 border-none"
          style={{
            background:
              'linear-gradient(90deg,#fb923c,var(--mauve),#34d399,#60a5fa)',
          }}
        />

        {/*  Ideoramas section  */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-7 w-7 star-pulse text-mauve" />
            <h2
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1.85rem',
                background:
                  'linear-gradient(90deg,#fb923c,var(--mauve),#06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Les créations de {profile.pseudo || '…'}
            </h2>
            <Palette className="h-7 w-7 text-mauve" />
          </div>

          {ideoramas.length === 0 ? (
            <IdeoCard className="max-w-md mx-auto">
              <div className="p-10 text-center">
                <p
                  className="flex justify-center items-center gap-2 bg-sidebar"
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: '1.4rem',
                  }}
                >
                  <Sprout /> Pas encore de créations ici…
                </p>
                <p className="mt-2 font-semibold opacity-5">
                  Revenons bientôt explorer !
                </p>
              </div>
            </IdeoCard>
          ) : (
            <IdeoramasGroup ideoramas={ideoramas} setIdeoramas={setIdeoramas} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
