import axios from '../services/axios.service';

import { handleApiError } from '@/lib/api';
type getProfileResponse = {
  profile: Profile;
  user: User;
};

type DeleteProfileResponse = {
  user: User;
  profile: Profile;
};
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

// Services
export const getMyProfile = async (
  parentalCode: string = ''
): Promise<ApiResponse<getProfileResponse>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/profile/`,
      parentalCode == '' ? {} : { parental_code: parseInt(parentalCode) ?? 0 }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const getProfile = async (
  userId: string
): Promise<ApiResponse<{profile: Profile}>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/profile/find`,
      {userId: userId}
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    response.data.data.profile.followers = response.data.data.profile.followers.map((f: any) => f.followerId);
    response.data.data.profile.following = response.data.data.profile.following.map((f: any) => f.followedId);
    return response.data;
  } catch (error: any) {
    return handleApiError(error.response?.data?.error?.message || 'Échec du profil');
  }
};

export const updateProfile = async (
  newUserInfo: Partial<User>,
  newProfileInfo: Partial<Profile>
) => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/profile/setting`,
      {
        user: newUserInfo,
        profile: newProfileInfo,
      }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const followUser = async (followedUserId: string) => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/profile/follow`,
      { followedUserId: followedUserId }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error.response?.data?.error?.message || 'Échec du suivi de l\'utilisateur');
  }
};

export const getFollowers = async (userId: string): Promise<ApiResponse<{pseudo: string, avatar: string}[]>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/profile/followers`,
      { userId: userId }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    console.log("Followers:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error.response?.data?.error?.message || 'Échec du chargement des followers');
  }
}

export const getFollowing = async (userId: string): Promise<ApiResponse<{pseudo: string, avatar: string}[]>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/profile/following`,
      { userId: userId }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    console.log("Following:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error.response?.data?.error?.message || 'Échec du chargement des utilisateurs suivis');
  }
};

export const deleteProfile = async (): Promise<
  ApiResponse<DeleteProfileResponse>
> => {
  try {
    const response = await axios.delete(
      `http://localhost:3001/api/profile/delete`
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors?.[0]?.message ||
          response.data.error?.message ||
          'Erreur lors de la suppression du profil'
      );
    }

    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
