import { Router } from 'express';
import IdeaController from './idea.controller';
import { authenticate, requireAuth } from '@/middlewares/authentication';
import { IIdeaService } from '@/types';


export default function createIdeaRoutes(
  service: IIdeaService
): Router {
  const controller = new IdeaController(service);
  const router = Router();

  router.use(authenticate, requireAuth);

  router.get('/', controller.getIdeas);
  router.post('/', controller.saveIdeas);

  return router;
}