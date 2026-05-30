import axios from '../services/axios.service';

import { handleApiError } from '@/lib/api';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

const BASE = '/api/ideorama';

export const getEmptyIdeorama = async (): Promise<ApiResponse<ModelsInfo>> => {
  const response = await axios.get(`${BASE}/empty`);
  return response.data;
};

export const getIdeoramaById = async (
  ideoramaId: string
): Promise<ApiResponse<Ideorama>> => {
  const response = await axios.get(`${BASE}/${ideoramaId}`);
  return response.data;
};

export const getAllIdeoramas = async (): Promise<ApiResponse<Ideorama[]>> => {
  const response = await axios.get(`${BASE}/all`);
  return response.data;
};

export const getUserIdeoramas = async (): Promise<ApiResponse<Ideorama[]>> => {
  const response = await axios.get(BASE);
  return response.data;
};

export const getParticularUserIdeoramas = async (
  userId: string
): Promise<ApiResponse<Ideorama[]>> => {
  const response = await axios.get(`${BASE}/user/${userId}`);
  return response.data;
};

export const createIdeorama = async (
  name: string
): Promise<ApiResponse<Ideorama>> => {
  const response = await axios.post(BASE, { name });
  return response.data;
};

/**
 * Get a short-lived signed URL for a storage key.
 */
export const getSignedUrl = async (
  key: string
): Promise<{ url: string; expiresAt: string }> => {
  const response = await axios.get('/api/storage/signed-url', {
    params: { key },
  });
  return response.data.data;
};

export const saveIdeorama = async (
  ideoramaId: string,
  scene: Record<string, unknown> | string | null
): Promise<boolean> => {
  try {
    const sceneObj: Record<string, unknown> =
      typeof scene === 'string' ? JSON.parse(scene) : (scene ?? {});

    const blob = new Blob([JSON.stringify(sceneObj)], {
      type: 'application/json',
    });

    const meta = {
      name: (sceneObj?.info as any)?.name as string | undefined,
      isPublic: (sceneObj?.global as any)?.isPublic as boolean | undefined,
    };

    const formData = new FormData();
    formData.append('file', blob, `${ideoramaId}.json`);
    formData.append('meta', JSON.stringify(meta));

    await axios.patch(`${BASE}/${ideoramaId}/save`, formData, {
      fetchOptions: { keepalive: true },
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return true;
  } catch (error) {
    console.error('saveIdeorama error:', handleApiError(error));
    return false;
  }
};

export const likeIdeorama = async (
  ideoramaId: string
): Promise<ApiResponse<Ideorama>> => {
  const response = await axios.post(`${BASE}/${ideoramaId}/like`);
  return response.data;
};

export const deleteIdeorama = async (ideoramaId: string): Promise<boolean> => {
  try {
    await axios.delete(`${BASE}/${ideoramaId}`);
    return true;
  } catch {
    return false;
  }
};
