import axios from '@/services/axios.service';

interface RegisterResponse {
  token: string;
  role?: string;
}

interface LoginResponse {
  token: string;
  role?: string;
}

interface ErrorResponse {
  status: string;
  error: {
    code: string;
    message: string;
  };
}

export const login = async (
  pseudo: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post('api/auth/login', { pseudo, password });

    if (response.data.status === 'error') {
      throw new Error(
        response.data.error?.message || response.data.errors[0]?.message
      );
    }

    console.log(response.data);

    const { accessToken, user } = response.data.data;
    return { token: accessToken, role: user.role };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const serverError: ErrorResponse = error.response.data;
      throw new Error(serverError.error.message);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const register = async (userData: any): Promise<RegisterResponse> => {
  try {
    const response = await axios.post('api/auth/register', userData);

    if (response.data.status === 'error') {
      throw new Error(response.data.error.message);
    }

    const { accessToken, user } = response.data.data;
    return { token: accessToken, role: user.role };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const serverError: ErrorResponse = error.response.data;
      throw new Error(serverError.error.message);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const getUserProfile = async (): Promise<any> => {
  const response = await axios.get('auth/profile');
  return response.data.data;
};
