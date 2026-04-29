import axios from './axios.service';

import { handleApiError } from '@/lib/api';

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
}

export interface VoxelModel {
    id: string;
    name: string;
    model: string | VoxelPoint[];
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const getVoxelModelById = async (
    voxelModelId: string
): Promise<ApiResponse<VoxelModel>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/', {
        voxelModelId,
    });

    return response.data;
};

export const createVoxelModel = async (
    name: string
): Promise<ApiResponse<VoxelModel>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/create', {
        voxelModel: {
            name,
        },
    });

    return response.data;
};

export const getAllVoxelModels = async (): Promise<ApiResponse<VoxelModel[]>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/all', {});
    return response.data;
};

export const autoSaveVoxelModel = async (
  voxelModelId: string | undefined,
  voxels: string,
  blob: Blob,
): Promise<boolean> => {
  try {
    if (!voxelModelId) {
      console.warn('Cannot save: missing ideoramaid or userid');
      return false;
    }

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    const formData = new FormData()
    formData.append('file', blob, `${voxelModelId}.glb`)
    formData.append('voxelModelId', voxelModelId)
    formData.append('model', voxels)
    const response = await axios
      .post(
        `${baseURL}/api/voxel/save`,
        formData,
        {
          fetchOptions: { keepalive: true },
        }
      )
      if (response.data.status === 'error') {
            throw new Error(
              response.data.errors[0]?.message || response.data.error?.message
            );
          }
          return response.data;
        } catch (error: any) {
          console.log("handleapierror")
          return handleApiError(error);
        }
      };

export const deleteVoxelModel = async (
    voxelModelId: string | undefined
): Promise<boolean> => {
    try {
    const response = await axios.post(
      `http://localhost:3001/api/voxel/delete`,
      {
        voxelModelId: voxelModelId,
      }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return true;
  } catch (error: any) {
    return false;
  }
};
