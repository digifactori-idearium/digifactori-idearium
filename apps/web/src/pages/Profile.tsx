import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/profile.service';

interface Profile {
    pseudo: string;
    bio: string;
    avatar: string;
}

const Profile: React.FC = () => {

    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile("1245");
                setProfile(response.data);
                setError('');
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchProfile();
    }, []);


  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Your profile 👋</h1>
      <span>pseudo: {profile? profile.pseudo : "pas connecté"}</span>
      <span>bio: {profile?.bio}</span>
      <span>avatar: {profile?.avatar}</span>
      <button>Access User info</button>
      <button>Update profile</button>
    </div>
  );
};

export default Profile;