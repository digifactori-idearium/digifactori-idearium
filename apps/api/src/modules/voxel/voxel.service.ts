import { VoxelModel } from '@prisma/client';

import { prisma } from '@/config/client.config';
import { IVoxelService } from '@/types';

const voxelModelTable = prisma.voxelModel;

export default class VoxelService implements IVoxelService {
  /**
   * Creates a new voxel model in DB.
   *
   * @param data - contains the voxel model name and the id of its creator ({name?: string, user: string})
   * @returns a Promise with the new voxel model (Promise<VoxelModel>)
   */
  async createVoxelModel(data: {
    name?: string;
    userId: string;
  }): Promise<VoxelModel> {
    return voxelModelTable.create({
      data: {
        name: data.name ?? 'New Voxel Model',
        userId: data.userId,
        model: '',
      },
    });
  }

  /**
   * Updates the model in BD of the voxel model.
   *
   * @param voxelModelId - the voxel model id to update
   * @param uploadPath - the new model to put in DB
   * @returns a Promise with the updated voxel model (Promise<VoxelModel>)
   * @throws error if the voxelModelId does not exist in DB
   */
  async updateVoxelModelPath(
    voxelModelId: string,
    uploadPath: string
  ): Promise<VoxelModel> {
    return voxelModelTable.update({
      where: {
        id: voxelModelId,
      },
      data: {
        model: uploadPath,
      },
    });
  }

  /**
   * Finds a voxel model in DB based on its ID.
   *
   * @param ideoramaId - the voxel model id we are searching for
   * @returns
   *  - if found, a Promise with the voxel model (Promise<VoxelModel>)
   *  - a Promise with null otherwise (Promise<null>)
   */
  async getVoxelModelById(
    voxelModelId: string,
    userId: string
  ): Promise<VoxelModel | null> {
    return voxelModelTable.findFirst({
      where: {
        id: voxelModelId,
        userId: userId,
      },
    });
  }

  /**
   * Finds all voxel models of a user in DB.
   *
   * @param userId - the user id for which we search for its voxel models
   * @returns a Promise with the voxel models (Promise<VoxelModel[]>)
   */
  async getUserVoxelModels(userId: string): Promise<VoxelModel[]> {
    return voxelModelTable.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Deletes a voxel model from DB based on its ID.
   *
   * @param ideoramaId - the unique id of the voxel model to delete
   * @returns a Promise with the deleted voxel model (Promise<VoxelModel>)
   * @throws error if the voxelModelId does not exist in DB
   */
  async deleteVoxelModel(
    voxelModelId: string,
    userId: string
  ): Promise<VoxelModel> {
    return voxelModelTable.delete({
      where: {
        id: voxelModelId,
        userId: userId,
      },
    });
  }
}
