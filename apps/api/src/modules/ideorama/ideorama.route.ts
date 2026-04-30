import { Router, type Router as ExpressRouter } from 'express';

import { authenticate, requireAuth } from '../../middlewares/authentication';

import IdeoramaController from './ideorama.controller';

import { checkIdeoramaExistence } from '@/middlewares/checkExistence';
import { IIdeoramaService } from '@/types';

export default function createIdeoramaRoutes(
  ideoramaService: IIdeoramaService
) {
  const ideoramaController = new IdeoramaController(ideoramaService);
  const ideoramasRoutes: ExpressRouter = Router();

  ideoramasRoutes.use(authenticate, requireAuth);

  ideoramasRoutes.get('/empty', ideoramaController.getEmptyIdeorama);
  ideoramasRoutes.get(
    '/:ideoramaId',
    ideoramaController.getIdeoramaByIdController
  );
  ideoramasRoutes.post('/', ideoramaController.createIdeoramaController);
  ideoramasRoutes.patch<{ ideoramaId: string }>(
    '/:ideoramaId/save',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    ideoramaController.saveIdeoramaController
  );
  ideoramasRoutes.get('/', ideoramaController.getUserIdeoramasController);
  ideoramasRoutes.post(
    '/like',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.body.ideoramaId,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    ideoramaController.likeIdeoramaController
  );
  ideoramasRoutes.delete<{ ideoramaId: string }>(
    '/:ideoramaId',
    (req, res, next) =>
      checkIdeoramaExistence(
        req.params.ideoramaId,
        res,
        next,
        ideoramaService.getIdeoramaById
      ),
    ideoramaController.deleteIdeoramaController
  );

  return ideoramasRoutes;
}
