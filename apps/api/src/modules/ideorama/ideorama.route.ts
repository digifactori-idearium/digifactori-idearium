import { Router, type Router as ExpressRouter } from 'express';

import authenticate from '../../middlewares/authenticate';

import {
  deleteIdeoramaController,
  getEmptyIdeorama,
  getIdeoramaByIdController,
  getUserIdeoramasController,
  saveIdeoramaController
} from './ideorama.controller';

const ideoramasRoutes: ExpressRouter = Router();

ideoramasRoutes.post('/', authenticate, getIdeoramaByIdController);
ideoramasRoutes.post('/save', authenticate, saveIdeoramaController);
ideoramasRoutes.post('/all', authenticate, getUserIdeoramasController);
ideoramasRoutes.post('/delete', authenticate, deleteIdeoramaController);
ideoramasRoutes.get('/empty', getEmptyIdeorama);

export default ideoramasRoutes;
