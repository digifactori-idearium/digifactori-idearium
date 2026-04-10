import { Router, type Router as ExpressRouter } from 'express';

import {
  deleteVoxelModelController,
  getUserVoxelModelsController,
  getVoxelModelByIdController,
  saveVoxelModelController,
} from './voxel.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';

const voxelRoutes: ExpressRouter = Router();

voxelRoutes.post('/', authenticate, requireAuth, getVoxelModelByIdController);
voxelRoutes.post('/save', authenticate, requireAuth, saveVoxelModelController);
voxelRoutes.post(
  '/all',
  authenticate,
  requireAuth,
  getUserVoxelModelsController
);
voxelRoutes.post(
  '/delete',
  authenticate,
  requireAuth,
  deleteVoxelModelController
);

export default voxelRoutes;
