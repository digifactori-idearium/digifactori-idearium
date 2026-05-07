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

  const fetchProfile = useCallback(async (parentalCode?: string) => {
    setLoading(true);
    try {
      const profile = await getMyProfile().then(res => res.data.profile);
      const user = await getUser(parentalCode).then(res => res.data.user);
      return { profile, user };
    } catch (error: any) {
      toast.error(error.message ?? 'Erreur lors de la récupération du profil');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = async (user: any, profile: any) => {
    setLoading(true);
    try {
      const token = await updateProfile(user, profile).then(
        res => res.data.accessToken
      );
      toast.success('Profil mis à jour !');
      return { token };
      return {};
    } catch (error: any) {
      toast.error(error.message ?? 'Profil non mis à jour !');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeProfile = async () => {
    setLoading(true);
    try {
      await deleteProfile();
      toast.success('Profil supprimé avec succès');
      removeToken();
    } catch (error: any) {
      toast.error(error.message ?? 'Profil non supprimé');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchProfile,
    updateUserProfile,
    removeProfile,
  };
};
