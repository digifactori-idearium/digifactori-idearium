import { Router, type Router as ExpressRouter } from 'express';

import VoxelController from './voxel.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { checkVoxelModelExistence } from '@/middlewares/checkExistence';
import { uploadGlb } from '@/middlewares/upload';
import { IVoxelService } from '@/types';

export default function createVoxelRoutes(
  voxelService: IVoxelService
): ExpressRouter {
  const voxelController = new VoxelController(voxelService);
  const router: ExpressRouter = Router();

  router.use(authenticate, requireAuth);

  router.get('/', voxelController.getUserVoxelModels);
  router.get('/:voxelModelId', voxelController.getVoxelModelById);
  router.post('/', voxelController.createVoxelModel);

  router.patch(
    '/:voxelModelId/save',
    (req, res, next) =>
      checkVoxelModelExistence(
        req.params.voxelModelId as string,
        res,
        next,
        voxelService.getVoxelModelById
      ),
    uploadGlb,
    voxelController.saveVoxelModel
  );

  router.delete(
    '/:voxelModelId',
    (req, res, next) =>
      checkVoxelModelExistence(
        req.params.voxelModelId as string,
        res,
        next,
        voxelService.getVoxelModelById
      ),
    voxelController.deleteVoxelModel
  );

  return router;
}
