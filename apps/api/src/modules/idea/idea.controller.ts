import { IIdeaService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

export default class IdeaController {
  constructor(private readonly ideaService: IIdeaService) {}

  createIdea = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const { content, column, priority, color } = req.body;

    const idea = await this.ideaService.createIdea({
      content,
      column,
      priority,
      color,
      userId,
    });

    HttpResponse.created(idea, 'Idée créée').send(res);
  });

  getUserIdeas = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const ideas = await this.ideaService.getUserIdeas(userId);

    HttpResponse.success(ideas, 'Idées récupérées').send(res);
  });

  updateIdea = asyncHandler(async (req, res) => {
    const ideaId = req.params.ideaId;
    const { content, column, priority, color } = req.body;

    const idea = await this.ideaService.updateIdea(ideaId, {
      content,
      column,
      priority,
      color,
    });

    HttpResponse.success(idea, 'Idée mise à jour').send(res);
  });

  deleteIdea = asyncHandler(async (req, res) => {
    const ideaId = req.params.ideaId;

    await this.ideaService.deleteIdea(ideaId);

    HttpResponse.success({ id: ideaId }, 'Idée supprimée').send(res);
  });
}