import { Router, type Router as ExpressRouter } from 'express';

import AssetController from './asset.controller';

import { authenticate, requireRole } from '@/middlewares/authentication';
import { uploadSingle, uploadBulk } from '@/middlewares/upload';
import { IAssetService } from '@/types';

export default function createAssetRoutes(
  assetService: IAssetService
): ExpressRouter {
  const assetController = new AssetController(assetService);
  const assetRoutes: ExpressRouter = Router();

  assetRoutes.use(authenticate);

  assetRoutes.get('/', assetController.getAssets);

  assetRoutes.get('/:assetId', assetController.getAssetById);

  assetRoutes.post(
    '/',
    requireRole('ADMIN'),
    uploadSingle,
    assetController.createAsset
  );

  assetRoutes.post(
    '/bulk',
    requireRole('ADMIN'),
    uploadBulk,
    assetController.bulkCreateAssets
  );

  assetRoutes.patch(
    '/:assetId',
    requireRole('ADMIN'),
    uploadSingle,
    assetController.updateAsset
  );

  assetRoutes.delete(
    '/bulk',
    requireRole('ADMIN'),
    assetController.bulkDeleteAssets
  );

  assetRoutes.delete(
    '/:assetId',
    requireRole('ADMIN'),
    assetController.deleteAsset
  );

  return assetRoutes;
}
