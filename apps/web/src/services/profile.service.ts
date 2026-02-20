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
    const response = await axios.post(
      `http://localhost:3001/api/profile/`,
      parentalCode == '' ? {} : { parental_code: parentalCode }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
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
    throw new Error(
      error.response?.data?.error?.message || 'Échec du profil' + error
    );
  }
};
