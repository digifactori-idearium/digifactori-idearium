import { Router } from 'express';
import IdeaController from './idea.controller';
import { authenticate, requireAuth } from '@/middlewares/authentication';
import { IIdeaService } from '@/types';

export default function createIdeaRoutes(ideaService: IIdeaService) {
  const controller = new IdeaController(ideaService);
  const router = Router();

  router.use(authenticate, requireAuth);

  router.post('/', controller.createIdea);
  router.get('/', controller.getUserIdeas);
  router.patch('/:ideaId', controller.updateIdea);
  router.delete('/:ideaId', controller.deleteIdea);

  return router;
}