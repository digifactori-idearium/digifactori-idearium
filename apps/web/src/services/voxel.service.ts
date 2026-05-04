import axios from './axios.service';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  status_code: number;
}

export interface VoxelPoint {
  x: number;
  y: number;
  z: number;
  color?: string;
}

export interface VoxelModel {
  id: string;
  name: string;
  model: string | null; // GLB storage key
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api/voxel';

export const createVoxelModel = async (
  name?: string
): Promise<ApiResponse<VoxelModel>> => {
  const response = await axios.post(BASE, { name });
  return response.data;
};

export const getAllVoxelModels = async (): Promise<
  ApiResponse<VoxelModel[]>
> => {
  const response = await axios.get(BASE);
  return response.data;
};

export const getVoxelModelById = async (
  voxelModelId: string
): Promise<ApiResponse<VoxelModel>> => {
  const response = await axios.get(`${BASE}/${voxelModelId}`);
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

/**
 * Save the GLB blob.
 * Voxel state is embedded inside the GLB extras
 */
export const saveVoxelModel = async (
  voxelModelId: string,
  blob: Blob
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('file', blob, `${voxelModelId}.glb`);

    const token = localStorage.getItem('token');
    const baseUrl =
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
      'http://localhost:3001';

    const response = await fetch(`${baseUrl}${BASE}/${voxelModelId}/save`, {
      method: 'PATCH',
      body: formData,
      keepalive: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving voxel model:', error);
    return false;
  }
};

export const deleteVoxelModel = async (
  voxelModelId: string
): Promise<boolean> => {
  try {
    await axios.delete(`${BASE}/${voxelModelId}`);
    return true;
  } catch {
    return false;
  }
};
