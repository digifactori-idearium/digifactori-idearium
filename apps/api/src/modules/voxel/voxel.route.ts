import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';

import VoxelController from './voxel.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { checkVoxelModelExistence } from '@/middlewares/checkExistence';
import { IVoxelService } from '@/types';

// Memory storage — the storage adapter (S3/Azure/Local) handles the actual write.
// diskStorage would write to disk first then re-read it, which is pointless.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'model/gltf-binary') {
      return cb(new Error('Only GLB files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

export default function createVoxelRoutes(
  voxelService: IVoxelService
): ExpressRouter {
  const voxelController = new VoxelController(voxelService);
  const router: ExpressRouter = Router();

  router.use(authenticate, requireAuth);

  // GET /voxel — all models for the authenticated user
  router.get('/', voxelController.getUserVoxelModels);

  // GET /voxel/:voxelModelId — single model
  router.get('/:voxelModelId', voxelController.getVoxelModelById);

  // POST /voxel — create empty model
  router.post('/', voxelController.createVoxelModel);

  // PATCH /voxel/:voxelModelId/save — upload GLB
  router.patch(
    '/:voxelModelId/save',
    (req, res, next) =>
      checkVoxelModelExistence(
        req.params.voxelModelId as string,
        res,
        next,
        voxelService.getVoxelModelById
      ),
    upload.single('file'),
    voxelController.saveVoxelModel
  );

  // DELETE /voxel/:voxelModelId — delete model + GLB from storage
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
