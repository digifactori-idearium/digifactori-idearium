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

export const saveVoxelModel = async (
    voxelModelId: string,
    voxels: VoxelPoint[]
): Promise<ApiResponse<null>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/save', {
        voxelModelId,
        voxelModel: {
            model: JSON.stringify(voxels),
        },
    });

    return response.data;
};

export const deleteVoxelModel = async (
    voxelModelId: string
): Promise<ApiResponse<null>> => {
    const response = await axios.post('http://localhost:3001/api/voxel/delete', {
        voxelModelId,
    });

    return response.data;
};