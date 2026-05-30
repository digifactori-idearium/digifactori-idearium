import { Router, type Router as ExpressRouter } from 'express';

import IdeoramaController from './ideorama.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { checkIdeoramaExistence } from '@/middlewares/checkExistence';
import { uploadScene } from '@/middlewares/upload';
import { IIdeoramaService } from '@/types';

export default function createIdeoramaRoutes(
  ideoramaService: IIdeoramaService
): ExpressRouter {
  const ideoramaController = new IdeoramaController(ideoramaService);
  const router: ExpressRouter = Router();

  // 1. PUBLIC ROUTES (No Auth)
  router.get('/all', ideoramaController.getIdeoramasController);

  router.use(authenticate, requireAuth);

  router.get('/empty', ideoramaController.getEmptyIdeorama);
  router.get('/', ideoramaController.getUserIdeoramasController);
  router.get(
    '/user/:userId',
    ideoramaController.getParticularUserIdeoramasController
  );

  router.get('/:ideoramaId', ideoramaController.getIdeoramaByIdController);

  router.post('/', ideoramaController.createIdeoramaController);

  router.post(
    '/:ideoramaId/save',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId as string,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    uploadScene,
    ideoramaController.saveIdeoramaController
  );

  router.patch(
    '/:ideoramaId/save',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId as string,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    uploadScene,
    ideoramaController.saveIdeoramaController
  );

  router.post(
    '/:ideoramaId/like',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId as string,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    ideoramaController.likeIdeoramaController
  );

  router.delete(
    '/:ideoramaId',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId as string,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    ideoramaController.deleteIdeoramaController
  );

  return router;
}
