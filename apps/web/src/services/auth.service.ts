import axios from '@/services/axios.service';

interface RegisterResponse {
  token: string;
  role?: string;
}

interface LoginResponse {
  token: string;
  role?: string;
}

export const login = async (
  pseudo: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post('api/auth/login', { pseudo, password });

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }

    console.log(response.data);

    const { accessToken, user } = response.data.data;
    return { token: accessToken, role: user.role };
  } catch (error: any) {
    if (error.response?.data) {
      const data = error.response.data;

      const message = data?.errors?.[0]
        ? `${data.errors[0].field ? data.errors[0].field + ':' : ''} ${data.errors[0].message}`
        : data?.error?.message ||
          data?.message ||
          "Une erreur inattendue s'est produite.";

      throw new Error(message);
    }

    throw new Error('Erreur réseau');
  }
};

export const register = async (userData: any): Promise<RegisterResponse> => {
  try {
    const response = await axios.post('api/auth/register', userData);

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }

    const { accessToken, user } = response.data.data;
    return { token: accessToken, role: user.role };
  } catch (error: any) {
    if (error.response?.data) {
      const data = error.response.data;

      const message = data?.errors?.[0]
        ? `${data.errors[0].field ? data.errors[0].field + ':' : ''} ${data.errors[0].message}`
        : data?.error?.message ||
          data?.message ||
          "Une erreur inattendue s'est produite.";

      throw new Error(message);
    }

    throw new Error('Erreur réseau');
  }
};
