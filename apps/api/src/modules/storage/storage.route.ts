import { Router, type Router as ExpressRouter } from 'express';

import StorageController from './storage.controller';
import StorageService from './storage.service';

import { authenticate, requireRole } from '@/middlewares/authentication';

export default function createStorageRoutes(): ExpressRouter {
  const storageService = new StorageService();
  const storageController = new StorageController(storageService);
  const router: ExpressRouter = Router();

  router.use(authenticate, requireRole('ADMIN'));

  /**
   * GET  api/storage          — get current config
   * POST api/storage/test     — test credentials without saving
   * PATCH api/storage         — update config (validates credentials first)
   * DELETE api/storage        — reset to LOCAL
   */
  router.get('/', storageController.getStorage);
  router.post('/test', storageController.testStorage);
  router.patch('/', storageController.updateStorage);
  router.delete('/', storageController.resetStorage);

  return router;
}
