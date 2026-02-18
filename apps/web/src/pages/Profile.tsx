import React, { useEffect, useState } from 'react';
import { type User, Profile as ProfileType } from "../../../api/src/config/client.config";
import { getProfile } from '../services/profile.service';

interface Profile {
    pseudo: string;
    bio: string;
    avatar: string;
}

const Profile: React.FC = () => {

    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{profile: ProfileType, user?: User} | null>(null);
    console.log("Profile component")
    localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWxzOHBvZmYwMDAwbDB1dG01Zmt3Yno1IiwiZW1haWwiOiJibGVzc2luZ3R1dGthMzA2QGdtYWlsLmNvbSIsInJvbGUiOiJDSElMRCIsImlhdCI6MTc3MTQzMTcyNywiZXhwIjoxNzcxNDQ2MTI3fQ.EzFf_9TppoRJcTXhfQ9q8yJkybvUnNeDP7rX1FS9qys");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log("cc")
                const response = await getProfile();
                setUser(response.data);
                setError('');
            } catch (err: any) {
                setError(err.message);
            }
        };
        console.log("fetching")
        fetchProfile();
    }, []);
console.log("profile: ", user);
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Your profile 👋</h1>
      <span>pseudo: {user ? user.profile.pseudo : "pas connecté"}</span>
      <span>bio: {user ? user.profile.bio : "pas connecté"}</span>
      <span>avatar: {user ? user.profile.avatar : "pas connecté"}</span>
      <button>Access User info</button>
      <button>Update profile</button>
    </div>
  );
};

export default Profile;