import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  deleteProfile,
  getMyProfile,
  getUser,
  updateProfile,
} from '../services/profile.service';

import { useUser } from '@/providers/UserProvider';

export const useProfile = () => {
  const { removeToken } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (parentalCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getMyProfile().then(res => res.data.profile);
      const user = await getUser(parentalCode).then(res => res.data.user);
      return { profile, user };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erreur lors de la récupération du profil';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(
    async (user: User | null, profile: Profile) => {
      setLoading(true);
      setError(null);
      try {
        const token = await updateProfile(user, profile).then(
          res => res.data.accessToken
        );
        toast.success('Profil mis à jour !');
        return { token };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Profil non mis à jour !';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteProfile();
      toast.success('Profil supprimé avec succès');
      removeToken();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Profil non supprimé';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [removeToken]);

  return {
    loading,
    error,
    fetchProfile,
    updateUserProfile,
    removeProfile,
  };
};
