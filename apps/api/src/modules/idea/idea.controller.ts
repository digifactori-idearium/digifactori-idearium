import { IIdeaService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

export default class IdeaController {
  constructor(private readonly ideaService: IIdeaService) {}

  getIdeas = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const data = await this.ideaService.getIdeas(userId);

    HttpResponse.success(data, 'Ideas récupérées').send(res);
  });

  saveIdeas = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const data = req.body;

    console.log(req.body)
    console.log(req.body.data)
    console.log(req.body.data.todo)
    const saved = await this.ideaService.saveIdeas(userId, data);

    HttpResponse.success(saved, 'Ideas sauvegardées').send(res);
  });
}