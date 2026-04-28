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
}

export interface VoxelModel {
    id: string;
    name: string;
    model: string | VoxelPoint[];
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const createVoxelModel = async (
    name: string
): Promise<ApiResponse<VoxelModel>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/save', {
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

export const getVoxelModelById = async (
    voxelModelId: string
): Promise<ApiResponse<VoxelModel>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/', {
        voxelModelId,
    });

    return response.data;
};

export const autoSaveVoxelModel = (
  voxelModelId: string | undefined,
  voxels: string,
  blob: Blob,
): boolean => {
  try {
    console.log("save")
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
    axios
      .post(
        `${baseURL}/api/voxel/save`,
        formData,
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
