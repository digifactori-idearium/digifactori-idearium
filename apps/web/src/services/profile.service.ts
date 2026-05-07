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

const BASE_URL = 'api/profile';

// Services
export const getMyProfile = async (): Promise<
  ApiResponse<getProfileResponse>
> => {
  try {
    const response = await axios.get(`${BASE_URL}/`);

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

export const getUser = async (
  parentalCode: string | undefined
): Promise<ApiResponse<{ user: User | null }>> => {
  try {
    const response = await axios.get(`${BASE_URL}/user`, {
      headers: { 'X-Parental-Code': parentalCode },
    });
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

export const updateProfile = async (
  newUserInfo: Partial<User | null>,
  newProfileInfo: Partial<Profile>
) => {
  try {
    const response = await axios.patch(`${BASE_URL}/setting`, {
      user: newUserInfo,
      profile: newProfileInfo,
    });

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
): Promise<ApiResponse<{ profile: Profile }>> => {
  try {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    response.data.data.profile.followers =
      response.data.data.profile.followers.map((f: any) => f.followerId);
    response.data.data.profile.following =
      response.data.data.profile.following.map((f: any) => f.followedId);
    return response.data;
  } catch (error: any) {
    return handleApiError(
      error.response?.data?.error?.message || 'Échec du profil'
    );
  }
};

export const followUser = async (followedUserId: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/follow`, {
      followedUserId: followedUserId,
    });
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(
      error.response?.data?.error?.message || "Échec du suivi de l'utilisateur"
    );
  }
};

export const getFollowers = async (
  userId: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.get(`${BASE_URL}/${userId}/followers`);
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    console.log('Followers:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(
      error.response?.data?.error?.message ||
        'Échec du chargement des followers'
    );
  }
};

export const getFollowing = async (
  userId: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.get(`${BASE_URL}/${userId}/following`);
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    console.log('Following:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(
      error.response?.data?.error?.message ||
        'Échec du chargement des utilisateurs suivis'
    );
  }
};

export const deleteProfile = async (): Promise<
  ApiResponse<DeleteProfileResponse>
> => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete`);

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
