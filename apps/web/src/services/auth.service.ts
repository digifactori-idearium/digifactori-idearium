import { handleApiError } from '@/lib/api';
import axios from '@/services/axios.service';

interface AuthResponse {
  token: string;
  role?: string;
}

export const login = async (
  pseudo: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await axios.post('api/auth/login', { pseudo, password });
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    const { accessToken, user } = response.data.data;
    return { token: accessToken, role: user.role };
  } catch (error) {
    return handleApiError(error);
  }
};

export const register = async (userData: any): Promise<AuthResponse> => {
  try {
    const response = await axios.post('api/auth/register', userData);
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    const { accessToken, user } = response.data.data;
    return { token: accessToken, role: user.role };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Change password for the currently authenticated user.
 * Requires a valid JWT in the axios instance headers.
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  try {
    await axios.patch('api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Request a password reset email.
 * Always resolves — the API never reveals whether the email exists.
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await axios.post('api/auth/reset-password/request', { email });
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Reset the password using the token from the email link.
 * @param token - JWT token from the query string of the reset link
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  try {
    await axios.patch(`api/auth/reset-password?token=${token}`, {
      newPassword,
      confirmPassword,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
