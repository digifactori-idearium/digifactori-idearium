import { VoxelModel } from '@prisma/client';

import { prisma } from '@/config/client.config';
import { IVoxelService } from '@/types';

const voxelModelTable = prisma.voxelModel;

export default class VoxelService implements IVoxelService {
  /**
   * Creates a new voxel model in DB.
   * model is null until the first GLB is saved via saveVoxelModel.
   *
   * @param data - Partial voxel model data (must include userId, name is optional) ({ name?: string; userId: string })
   * @returns The created voxel model as Promise<VoxelModel>
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
   * The actual GLB file is handled separately in the storage service, this method only updates the DB record with the new storage key.
   *
   * @param voxelModelId - the id of the voxel model to update (string)
   * @param fileKey - the new storage key for the GLB file (string)
   * @returns The updated voxel model as Promise<VoxelModel>
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
   *
   * @params voxelModelId - the id of the voxel model to find (string)
   * @returns The found voxel model as Promise<VoxelModel>, or Promise<null> if not found
   */
  async getVoxelModelById(voxelModelId: string): Promise<VoxelModel | null> {
    return await voxelModelTable.findFirst({
      where: { id: voxelModelId },
    });
  }

  /**
   * Finds all voxel models for a user, ordered by creation date.
   *
   * @params userId - the id of the user whose voxel models to find (string)
   * @returns An array of voxel models belonging to the user as Promise<VoxelModel[]>
   */
  async getUserVoxelModels(userId: string): Promise<VoxelModel[]> {
    return await voxelModelTable.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds all existing voxel models, ordered by creation date.
   *
   * @returns An array of all voxel models as Promise<VoxelModel[]>
   */
  async getVoxelModels(): Promise<VoxelModel[]> {
    return await voxelModelTable.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deletes a voxel model from DB.
   *
   * @param voxelModelId - the id of the voxel model to delete (string)
   * @return The deleted voxel model as Promise<VoxelModel>
   * @throws an error if the voxel model is not found
   */
  async deleteVoxelModel(voxelModelId: string): Promise<VoxelModel> {
    return await voxelModelTable.delete({
      where: { id: voxelModelId },
    });
  }
}
