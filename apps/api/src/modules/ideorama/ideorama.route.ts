import { Router, type Router as ExpressRouter } from 'express';

import authenticate from '../../middlewares/authenticate';

import {
  createIdeoramaController,
  getMyIdeoramasController,
  getIdeoramaByIdController,
  updateIdeoramaController,
} from './ideorama.controller';

const ideoramasRoutes: ExpressRouter = Router();

ideoramasRoutes.post('/', authenticate, createIdeoramaController);
ideoramasRoutes.get('/my', authenticate, getMyIdeoramasController);
ideoramasRoutes.get('/:id', authenticate, getIdeoramaByIdController);
ideoramasRoutes.patch('/:id', authenticate, updateIdeoramaController);
export default ideoramasRoutes;
