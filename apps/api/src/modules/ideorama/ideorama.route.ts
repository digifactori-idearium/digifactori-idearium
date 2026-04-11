import { Router, type Router as ExpressRouter } from 'express';

import { authenticate, requireAuth } from '../../middlewares/authentication';

import {
  createIdeoramaController,
  deleteIdeoramaController,
  getEmptyIdeorama,
  getIdeoramaByIdController,
  getUserIdeoramasController,
  saveIdeoramaController,
} from './ideorama.controller';

const ideoramasRoutes: ExpressRouter = Router();

ideoramasRoutes.post('/', authenticate, requireAuth, getIdeoramaByIdController);
ideoramasRoutes.post(
  '/create',
  authenticate,
  requireAuth,
  createIdeoramaController
);
ideoramasRoutes.post(
  '/save',
  authenticate,
  requireAuth,
  saveIdeoramaController
);
ideoramasRoutes.post(
  '/all',
  authenticate,
  requireAuth,
  getUserIdeoramasController
);
ideoramasRoutes.post(
  '/delete',
  authenticate,
  requireAuth,
  deleteIdeoramaController
);

ideoramasRoutes.get('/empty', getEmptyIdeorama);

export default ideoramasRoutes;
