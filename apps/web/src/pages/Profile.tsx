import React, { useEffect, useState } from 'react';

import { getProfile, updateProfile } from '../services/profile.service';

const Profile: React.FC = () => {
  const getProfileWithParentalCode = async (parentalCode: string) => {
    const response = await getProfile(parentalCode);
    console.log('with parentalCode: ', response.data);
    return response.data;
  };

  const [user, setUser] = useState<{ profile: Profile; user?: User } | null>(
    null
  );
  const [parentalCode, setParentalCode] = useState('1234');

  const [password, setPassword] = useState('');

  // localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWx0aTFoaG8wMDAwN2t1dGZnZGVxaWN3IiwiZW1haWwiOiJyb2JpbjNAZ21haWwuY29tIiwicm9sZSI6IkNISUxEIiwiaWF0IjoxNzcxNTA3ODYwLCJleHAiOjE3NzE1MjIyNjB9.541Cv5cdZyxwAApQJXVqODGhartaPkVuTerq6w5ybig");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response.data);
      } catch (err: any) {
        console.log('error: ', err);
      }
    };
    fetchProfile();
  }, []);

  const [updatedUser, setUpdatedUser] = useState(
    user?.user ?? {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      parental_code: '',
      role: 'CHILD' as Role,
    }
  );

  const [updatedProfile, setUpdatedProfile] = useState({
    pseudo: user?.profile.pseudo,
    bio: user?.profile.bio ?? '',
    avatar: user?.profile.avatar ?? '',
  });

  useEffect(() => {
    if (user?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUpdatedUser({
        email: user.user.email,
        first_name: user.user.first_name,
        last_name: user.user.last_name,
        password: user.user.password,
        parental_code: user.user.parental_code ? user.user.parental_code : '',
        role: user.user.role,
      });
      if (user?.profile) {
        setUpdatedProfile({
          pseudo: user?.profile.pseudo,
          bio: user.profile.bio ?? '',
          avatar: user.profile.avatar ?? '',
        });
      }
    }
  }, [user]);

  if (user?.user) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Ton profiiiiile{} 👋
        </h1>
        <span>
          {' '}
          mdp (pour modifier){' '}
          <input
            type="text"
            value={password}
            onChange={e => setPassword(e.target.value)}
          ></input>
        </span>
        {/* <span> e-mail: <input type="text" value={user.user.email} onChange={e => setUser({...user, user: {...user.user as User, email: e.target.value}})}></input></span> */}
        <span>
          {' '}
          prénom:{' '}
          <input
            type="text"
            value={updatedUser.email}
            onChange={e =>
              setUpdatedUser({ ...updatedUser, email: e.target.value })
            }
          ></input>
        </span>
        <span>
          {' '}
          prénom:{' '}
          <input
            type="text"
            value={updatedUser.first_name}
            onChange={e =>
              setUpdatedUser({ ...updatedUser, first_name: e.target.value })
            }
          ></input>
        </span>
        <span>
          {' '}
          nom de famille:{' '}
          <input
            type="text"
            value={updatedUser.last_name}
            onChange={e =>
              setUpdatedUser({ ...updatedUser, last_name: e.target.value })
            }
          ></input>
        </span>
        <span>
          mot de passe:{' '}
          <input
            type="text"
            value={updatedUser.password}
            onChange={e =>
              setUpdatedUser({ ...updatedUser, password: e.target.value })
            }
          ></input>{' '}
        </span>
        {updatedUser.parental_code && updatedUser.parental_code != '' && (
          <span>
            code parental
            <input
              type="text"
              value={updatedUser.parental_code}
              onChange={e =>
                setUpdatedUser({
                  ...updatedUser,
                  parental_code: e.target.value,
                })
              }
            ></input>{' '}
          </span>
        )}
        <span>
          pseudo:{' '}
          <input
            type="text"
            value={updatedProfile.pseudo}
            onChange={e =>
              setUpdatedProfile({ ...updatedProfile, pseudo: e.target.value })
            }
          ></input>
        </span>
        <span>
          bio:{' '}
          <input
            type="text"
            value={updatedProfile.bio}
            onChange={e =>
              setUpdatedProfile({ ...updatedProfile, bio: e.target.value })
            }
          ></input>
        </span>
        <span>
          avatar:{' '}
          <input
            type="text"
            value={updatedProfile.avatar}
            onChange={e =>
              setUpdatedProfile({ ...updatedProfile, avatar: e.target.value })
            }
          ></input>
        </span>
        <button
          onClick={() => updateProfile(password, updatedUser, updatedProfile)}
        ></button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Ton profile 👋</h1>
      <span>pseudo: {user ? user.profile.pseudo : 'pas connecté'}</span>
      <span>bio: {user ? user.profile.bio : 'pas connecté'}</span>
      <span>avatar: {user ? user.profile.avatar : 'pas connecté'}</span>
      <p>Votre code parental</p>
      <input
        type="text"
        value={parentalCode}
        onChange={e => setParentalCode(e.target.value)}
      ></input>
      <button
        onClick={() =>
          getProfileWithParentalCode(parentalCode).then(res => setUser(res))
        }
      ></button>
    </div>
  );
};

export default Profile;
