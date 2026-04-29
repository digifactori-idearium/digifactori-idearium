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
  ideoramasRoutes.post(
    '/',
    authenticate,
    requireAuth,
    ideoramaController.getIdeoramaByIdController
  );
  ideoramasRoutes.post(
    '/create',
    authenticate,
    requireAuth,
    ideoramaController.createIdeoramaController
  );
  ideoramasRoutes.post(
    '/save',
    authenticate,
    requireAuth,
    (req, res, next) => checkIdeoramaExistence(req, res, next, ideoramaService.getIdeoramaById),
    ideoramaController.saveIdeoramaController
  );
  ideoramasRoutes.post(
    '/all',
    authenticate,
    requireAuth,
    ideoramaController.getUserIdeoramasController
  );
  ideoramasRoutes.post(
    '/like',
    authenticate,
    requireAuth,
    (req, res, next) => checkIdeoramaExistence(req, res, next, ideoramaService.getIdeoramaById),
    ideoramaController.likeIdeoramaController
  );
  ideoramasRoutes.post(
    '/delete',
    authenticate,
    requireAuth,
    (req, res, next) => checkIdeoramaExistence(req, res, next, ideoramaService.getIdeoramaById),
    ideoramaController.deleteIdeoramaController
  );
  ideoramasRoutes.get('/empty', ideoramaController.getEmptyIdeorama);

  return ideoramasRoutes;
}
