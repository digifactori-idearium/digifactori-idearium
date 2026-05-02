import axios from './axios.service';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  status_code: number;
}

export interface VoxelModel {
  id: string;
  name: string;
  model: string | null; // storage key ex "voxel-models/blablabla.glb"
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api/voxel';

/**
 * Create a new empty voxel model.
 */
export const createVoxelModel = async (
  name?: string
): Promise<ApiResponse<VoxelModel>> => {
  const response = await axios.post(BASE, { name });
  return response.data;
};

/**
 * Fetch all voxel models for the authenticated user.
 */
export const getAllVoxelModels = async (): Promise<
  ApiResponse<VoxelModel[]>
> => {
  const response = await axios.get(BASE);
  return response.data;
};

/**
 * Fetch a single voxel model by ID.
 */
export const getVoxelModelById = async (
  voxelModelId: string
): Promise<ApiResponse<VoxelModel>> => {
  const response = await axios.get(`${BASE}/${voxelModelId}`);
  return response.data;
};

/**
 * Save (overwrite) the GLB file for a voxel model.
 *
 * Uses keepalive so the request survives page unload (auto-save on close).
 */
export const saveVoxelModel = async (
  voxelModelId: string,
  blob: Blob
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('file', blob, `${voxelModelId}.glb`);

    await axios.patch(`${BASE}/${voxelModelId}/save`, formData, {
      fetchOptions: { keepalive: true },
    });

    return true;
  } catch (error) {
    console.error('Error saving voxel model:', error);
    return false;
  }
};

/**
 * Delete a voxel model and its GLB file from storage.
 */
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
