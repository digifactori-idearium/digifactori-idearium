import path from 'path';

import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';

import VoxelController from './voxel.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { checkVoxelModelExistence } from '@/middlewares/checkExistence';
import { IVoxelService } from '@/types';

// config stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'glb'));
  },
  filename: (req, file, cb) => {
    const id = String(path.parse(file.originalname).name);

    // validation stricte
    if (!/^[a-z0-9]+$/i.test(id)) {
      return cb(new Error('Invalid ideoramaId'));
    }

    cb(null, `${id}.glb`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'model/gltf-binary') {
    return cb(new Error('Only GLB files allowed'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default function createVoxelRoutes(voxelService: IVoxelService) {
  const voxelController = new VoxelController(voxelService);
  const voxelRoutes: ExpressRouter = Router();

  voxelRoutes.use(authenticate, requireAuth);

  voxelRoutes.get(
    '/:voxelModelId',
    voxelController.getVoxelModelByIdController
  );
  voxelRoutes.post('/', voxelController.createVoxelModelController);
  voxelRoutes.patch<{ voxelModelId: string }>(
    '/:voxelModelId/save',
    (req, res, next) =>
      checkVoxelModelExistence(
        req.params.voxelModelId,
        res,
        next,
        voxelService.getVoxelModelById
      ),
    upload.single('file'),
    voxelController.saveVoxelModelController
  );
  voxelRoutes.get('/', voxelController.getUserVoxelModelsController);
  voxelRoutes.delete<{ voxelModelId: string }>(
    '/:voxelModelId',
    (req, res, next) => {
      checkVoxelModelExistence(
        req.params.voxelModelId,
        res,
        next,
        voxelService.getVoxelModelById
      );
    },
    voxelController.deleteVoxelModelController
  );

  return voxelRoutes;
}
