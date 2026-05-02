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
  name: string
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

/**
 * Saves the scene JSON to the database.
 * Accepts either a parsed object or a JSON string.
 */
export const autoSaveIdeorama = async (
  scene: string | Record<string, unknown> | null,
  ideoramaId: string | undefined,
  userId: string | undefined
): Promise<boolean> => {
  try {
    if (!ideoramaId || !userId) {
      console.warn('autoSaveIdeorama: missing ideoramaId or userId');
      return false;
    }

    // Always send a parsed object — the API accepts both but an object is cleaner
    const sceneObj: Record<string, unknown> =
      typeof scene === 'string' ? JSON.parse(scene) : (scene ?? {});

    await axios.post('/api/ideorama/save', {
      ideoramaId,
      ideorama: { scene: sceneObj, userId },
    });

    return true;
  } catch (error) {
    console.error('autoSaveIdeorama error:', error);
    return false;
  }
};

/**
 * Fire-and-forget save using keepalive fetch.
 * Safe to call from beforeunload / visibilitychange.
 */
export const beaconSaveIdeorama = (
  scene: string | Record<string, unknown> | null,
  ideoramaId: string | undefined,
  userId: string | undefined
): boolean => {
  try {
    if (!ideoramaId || !userId || !scene) {
      console.warn('beaconSaveIdeorama: missing required fields');
      return false;
    }

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const url = `${baseURL}/api/ideorama/save`;

    const sceneObj: Record<string, unknown> =
      typeof scene === 'string' ? JSON.parse(scene) : scene;

    const payload = JSON.stringify({
      ideoramaId,
      ideorama: { scene: sceneObj, userId },
    });

    const token = localStorage.getItem('token');

    fetch(url, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: payload,
    }).catch(err => console.error('beaconSaveIdeorama fetch failed:', err));

    return true;
  } catch (error) {
    console.error('beaconSaveIdeorama error:', error);
    return false;
  }
};

export const getAllIdeoramas = async (): Promise<ApiResponse<Ideorama[]>> => {
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
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
