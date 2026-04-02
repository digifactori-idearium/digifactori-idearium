import { prisma } from '../../config/client.config';

const voxelModelTable = prisma.voxelModel;

export const createVoxelModel = async (data: {
    name?: string;
    userId: string;
}) => {
    return voxelModelTable.create({
        data: {
            name: data.name ?? 'New Voxel Model',
            userId: data.userId,
            model: '',
        },
    });
};

export const updateVoxelModelPath = async (
    voxelModelId: string,
    uploadPath: string
) => {
    return voxelModelTable.update({
        where: {
            id: voxelModelId,
        },
        data: {
            model: uploadPath,
        },
    });
};

export const getVoxelModelById = async (
    voxelModelId: string,
    userId: string
) => {
    return voxelModelTable.findFirst({
        where: {
            id: voxelModelId,
            userId: userId,
        },
    });
};

export const getUserVoxelModels = async (userId: string) => {
    return voxelModelTable.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const deleteVoxelModel = async (voxelModelId: string, userId: string) => {
    return voxelModelTable.deleteMany({
        where: {
            id: voxelModelId,
            userId: userId,
        },
    });
};