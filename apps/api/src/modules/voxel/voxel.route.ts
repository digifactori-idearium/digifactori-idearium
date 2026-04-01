import { Router, type Router as ExpressRouter } from 'express';

import authenticate from '../../middlewares/authenticate';
import {
    deleteVoxelModelController,
    getUserVoxelModelsController,
    getVoxelModelByIdController,
    saveVoxelModelController,
} from './voxel.controller';

const voxelRoutes: ExpressRouter = Router();

voxelRoutes.post('/', authenticate, getVoxelModelByIdController);
voxelRoutes.post('/save', authenticate, saveVoxelModelController);
voxelRoutes.post('/all', authenticate, getUserVoxelModelsController);
voxelRoutes.post('/delete', authenticate, deleteVoxelModelController);

export default voxelRoutes;