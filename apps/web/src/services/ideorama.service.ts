import axios from '../services/axios.service';

import { handleApiError } from '@/lib/api';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

export const fetchIdeoramaModelFromStorage = async (
  fileKey: string
): Promise<ModelsInfo> => {
  try {
    const response = await axios.get(`/api/storage/file/${fileKey}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ideorama model from storage:', error);
    return getEmptyIdeorama().then(res => res.data);
  }
};

export const searchIdeorama = async (
  ideoramaId: string
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post('/api/ideorama/', { ideoramaId });
    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const getEmptyIdeorama = async (): Promise<ApiResponse<ModelsInfo>> => {
  try {
    const response = await axios.get('/api/ideorama/empty');
    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const createIdeorama = async (
  name: string,
  userId: string | undefined
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post('/api/ideorama/create', {
      ideorama: { name, userId },
    });
    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
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
      console.warn('autoSaveIdeorama: missing ideoramaId or userId');
      return false;
    }

    axios
      .post(
        '/api/ideorama/save',
        { ideoramaId, ideorama: { model, userId } },
        { fetchOptions: { keepalive: true } }
      )
      .catch(err => console.error('autoSaveIdeorama failed:', err));

    return true;
  } catch (error) {
    console.error('autoSaveIdeorama error:', error);
    return false;
  }
};

export const getAllIdeoramas = async (
  userId: string | undefined
): Promise<ApiResponse<Ideorama[]>> => {
  try {
    const response = await axios.post('/api/ideorama/all', { userId });
    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const likeIdeorama = async (
  ideoramaId: string | undefined
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post('/api/ideorama/like', { ideoramaId });
    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
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
    const response = await axios.post('/api/ideorama/delete', { ideoramaId });
    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }
    return true;
  } catch (error: any) {
    return handleApiError(error);
  }
};
