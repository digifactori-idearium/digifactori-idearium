import axios from '../services/axios.service';

import { handleApiError } from '@/lib/api';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

const BASE = '/api/ideorama';

const API_BASE_FOR_BEACON =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
    if (!ideoramaId || !scene) return false;

    const sceneObj = typeof scene === 'string' ? JSON.parse(scene) : scene;

    const payload = JSON.stringify({
      ideoramaId,
      scene: sceneObj,
      token: localStorage.getItem('token'),
    });

    return navigator.sendBeacon(
      `${API_BASE_FOR_BEACON}/api/ideorama/beacon-save`,
      new Blob([payload], {
        type: 'application/json',
      })
    );
  } catch (error) {
    console.error('beaconSaveIdeorama error:', error);
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
