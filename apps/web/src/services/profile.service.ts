import axios from '../services/axios.service';

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
export const getProfile = async (
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
    throw new Error(
      error.response?.data?.error?.message ||
        'Échec de la suppression du profil'
    );
  }
};
