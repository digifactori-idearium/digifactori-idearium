import { VoxelModel } from '@prisma/client';

import { prisma } from '@/config/client.config';
import { IVoxelService } from '@/types';

const voxelModelTable = prisma.voxelModel;

export default class VoxelService implements IVoxelService {
  /**
   * Creates a new voxel model in DB.
   * model is null until the first GLB is saved via saveVoxelModel.
   */
  async createVoxelModel(data: {
    name?: string;
    userId: string;
  }): Promise<VoxelModel> {
    return await voxelModelTable.create({
      data: {
        name: data.name ?? 'New Voxel Model',
        userId: data.userId,
        model: '',
      },
    });
  }

  /**
   * Updates the GLB storage key for a voxel model.
   */
  async updateVoxelModelFileKey(
    voxelModelId: string,
    fileKey: string
  ): Promise<VoxelModel> {
    return await voxelModelTable.update({
      where: { id: voxelModelId },
      data: { model: fileKey },
    });
  }

  /**
   * Finds a voxel model by ID.
   */
  async getVoxelModelById(voxelModelId: string): Promise<VoxelModel | null> {
    return await voxelModelTable.findFirst({
      where: { id: voxelModelId },
    });
  }

  /**
   * Finds all voxel models for a user, ordered by creation date.
   */
  async getUserVoxelModels(userId: string): Promise<VoxelModel[]> {
    return await voxelModelTable.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds all existing voxel models, ordered by creation date.
   */
  async getVoxelModels(): Promise<VoxelModel[]> {
    return await voxelModelTable.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deletes a voxel model from DB.
   */
  async deleteVoxelModel(voxelModelId: string): Promise<VoxelModel> {
    return await voxelModelTable.delete({
      where: { id: voxelModelId },
    });
  }
}
