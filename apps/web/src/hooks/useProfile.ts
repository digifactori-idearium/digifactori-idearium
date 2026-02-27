import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  getProfile,
  updateProfile,
  deleteProfile,
} from '../services/profile.service';

import { useUser } from '@/providers/UserProvider';

export const useProfile = () => {
  const { removeToken } = useUser();
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async (parentalCode?: string) => {
    setLoading(true);
    try {
      const res = await getProfile(parentalCode);
      return res.data;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = async (user: any, profile: any) => {
    setLoading(true);
    try {
      await updateProfile(user, profile);
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      toast.error(error.message);
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
      toast.error(error.message);
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
