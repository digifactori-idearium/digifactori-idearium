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

export const saveIdeorama = async (
  ideoramaId: string,
  scene: Record<string, unknown> | string | null
): Promise<boolean> => {
  try {
    const sceneObj: Record<string, unknown> =
      typeof scene === 'string' ? JSON.parse(scene) : (scene ?? {});

    await axios.patch(`${BASE}/${ideoramaId}/save`, { scene: sceneObj });
    return true;
  } catch (error) {
    console.error('saveIdeorama error:', handleApiError(error));
    return false;
  }
};

export const beaconSaveIdeorama = (
  ideoramaId: string | undefined,
  scene: Record<string, unknown> | string | null
): boolean => {
  try {
    if (!ideoramaId || !scene) {
      console.warn('beaconSaveIdeorama: missing required fields');
      return false;
    }

    const sceneObj: Record<string, unknown> =
      typeof scene === 'string' ? JSON.parse(scene) : scene;

    const token = localStorage.getItem('token');

    fetch(`${BASE}/${ideoramaId}/save`, {
      method: 'PATCH',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ scene: sceneObj }),
    }).catch(err => console.error('beaconSaveIdeorama failed:', err));

    return true;
  } catch (error) {
    console.error('beaconSaveIdeorama error:', handleApiError(error));
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
