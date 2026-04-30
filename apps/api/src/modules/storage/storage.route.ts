import { Router, type Router as ExpressRouter } from 'express';

import StorageController from './storage.controller';
import StorageService from './storage.service';

import { authenticate, requireRole } from '@/middlewares/authentication';

export default function createStorageRoutes(): ExpressRouter {
  const storageService = new StorageService();
  const storageController = new StorageController(storageService);
  const router: ExpressRouter = Router();

  router.get('/file/{*splat}', authenticate, storageController.getStorageFile);

  router.get(
    '/',
    authenticate,
    requireRole('ADMIN'),
    storageController.getStorage
  );

  router.post(
    '/test',
    authenticate,
    requireRole('ADMIN'),
    storageController.testStorage
  );

  router.patch(
    '/',
    authenticate,
    requireRole('ADMIN'),
    storageController.updateStorage
  );

  router.delete(
    '/',
    authenticate,
    requireRole('ADMIN'),
    storageController.resetStorage
  );

  return router;
}
