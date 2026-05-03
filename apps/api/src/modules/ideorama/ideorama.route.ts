import { Router, type Router as ExpressRouter } from 'express';

import IdeoramaController from './ideorama.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { checkIdeoramaExistence } from '@/middlewares/checkExistence';
import { IIdeoramaService } from '@/types';

export default function createIdeoramaRoutes(
  ideoramaService: IIdeoramaService
): ExpressRouter {
  const ideoramaController = new IdeoramaController(ideoramaService);
  const router: ExpressRouter = Router();

  router.use(authenticate, requireAuth);

  router.get('/empty', ideoramaController.getEmptyIdeorama);

  router.get('/', ideoramaController.getUserIdeoramasController);

  router.get('/:ideoramaId', ideoramaController.getIdeoramaByIdController);

  router.post('/', ideoramaController.createIdeoramaController);

  router.patch(
    '/:ideoramaId/save',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId as string,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
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
