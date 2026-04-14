import { Router, type Router as ExpressRouter } from 'express';

import VoxelController from './voxel.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { IVoxelService } from '@/types';

export default function createVoxelRoutes(voxelService: IVoxelService) {
  const voxelController = new VoxelController(voxelService);

  const voxelRoutes: ExpressRouter = Router();
  voxelRoutes.post(
    '/',
    authenticate,
    requireAuth,
    voxelController.getVoxelModelByIdController
  );
  voxelRoutes.post(
    '/save',
    authenticate,
    requireAuth,
    voxelController.saveVoxelModelController
  );
  voxelRoutes.post(
    '/all',
    authenticate,
    requireAuth,
    voxelController.getUserVoxelModelsController
  );
  voxelRoutes.post(
    '/delete',
    authenticate,
    requireAuth,
    voxelController.deleteVoxelModelController
  );

  return voxelRoutes
}
