
import axios from '../services/axios.service';

import { handleApiError } from '@/lib/api';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

export const searchIdeorama = async (
  ideoramaId: string
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.get(`http://localhost:3001/api/ideorama/${ideoramaId}`);
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

export const createIdeorama = async (
  name: string,
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/`,
      {
        ideorama: {
          name: name,
        },
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

export const autoSaveIdeorama = (
  model: string | null,
  ideoramaId: string | undefined,
  userId: string | undefined
): boolean => {
  try {
    if (!ideoramaId || !userId) {
      console.warn('Cannot save: missing ideoramaid or userid');
      return false;
    }

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    axios
      .post(
        `${baseURL}/api/ideorama/${ideoramaId}/save`,
        {
          ideorama: { model, userId },
        },
        {
          fetchOptions: { keepalive: true },
        }
      )
      .catch(err => console.error('Keepalive save failed:', err));

    return true;
  } catch (error) {
    console.error('Error queuing keepalive save:', error);
    return false;
  }
};

export const getAllIdeoramas = async (
): Promise<ApiResponse<Ideorama[]>> => {
  try {
    const response = await axios.get(`http://localhost:3001/api/ideorama/`);
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

export const likeIdeorama = async (
  ideoramaId: string | undefined,
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/like`,
      {
        ideoramaId: ideoramaId,
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

export const deleteIdeorama = async (
  ideoramaId: string | undefined
): Promise<boolean> => {
  try {
    const response = await axios.delete(`http://localhost:3001/api/ideorama/${ideoramaId}`);
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return true;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const getEmptyIdeorama = async (): Promise<ApiResponse<ModelsInfo>> => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/ideorama/empty`
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
