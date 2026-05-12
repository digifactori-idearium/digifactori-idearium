import axios from 'axios';

interface ApiErrorResponse {
  errors?: Array<{ field?: string; message: string }>;
  error?: { message: string };
  message?: string;
}

interface AxiosErrorResponse {
  response?: {
    data?: ApiErrorResponse;
  };
}

export const handleApiError = (error: AxiosErrorResponse | unknown): never => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as AxiosErrorResponse).response?.data;

    const message = data?.errors?.[0]
      ? `${data.errors[0].field ? data.errors[0].field + ':' : ''} ${data.errors[0].message}`
      : data?.error?.message ||
        data?.message ||
        "Une erreur inattendue s'est produite.";

    throw new Error(message);
  }

  throw new Error('Erreur réseau');
};

export const isNotFoundError = (err: unknown): boolean => {
  if (axios.isAxiosError(err)) {
    return err.response?.status === 404 || err.response?.status === 403;
  }
  return false;
};
