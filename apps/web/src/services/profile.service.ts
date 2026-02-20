import { AxiosResponse } from 'axios';

import axios from '../services/axios.service';

type getProfileResponse = {
  profile: Profile;
  user: User;
};

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

// Services
export const getProfile = async (
  parentalCode: string = ''
): Promise<ApiResponse<getProfileResponse>> => {
  try {
    const response: AxiosResponse<ApiResponse<getProfileResponse>> =
      await axios.post(
        `http://localhost:3001/api/profile/`,
        parentalCode == '' ? {} : { parental_code: parentalCode }
      );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Échec du profil');
  }
};

export const updateProfile = async (
  newUserInfo: Partial<User>,
  newProfileInfo: Partial<Profile>
) => {
  try {
    const response: AxiosResponse<ApiResponse<getProfileResponse>> =
      await axios.post(`http://localhost:3001/api/profile/setting`, {
        user: newUserInfo,
        profile: newProfileInfo,
      });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message || 'Échec du profil' + error
    );
  }
};
