import { IdeasSchema } from './idea.validation';

import { IIdeaService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

export default class IdeaController {
  constructor(private readonly ideaService: IIdeaService) {}

  /**
   * Retrieves the authenticated user's ideas. If the user has no ideas, returns an object with empty arrays for todo, progress, and done.
   *
   * @route  GET /idea
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: { ideas: Ideas } }
   */
  getIdeas = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const data = await this.ideaService.getIdeas(userId);

    HttpResponse.success(data, 'Ideas récupérées').send(res);
  });

  /**
   * Updates the authenticated user's ideas.
   * If the user has no existing ideas, creates a new entry. Validates the input data against the IdeasSchema before saving.
   *
   * @route  POST /idea
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: { ideas: Ideas } }
   */
  saveIdeas = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const data = req.body;
    console.log('validation checking');
    const result = await IdeasSchema.safeParseAsync(data.data);
    console.log('validation +result', result);

    if (failOnValidation(result, res)) return;
    console.log('validation successed');

    const saved = await this.ideaService.saveIdeas(userId, data);

    HttpResponse.success(saved, 'Ideas sauvegardées').send(res);
  });
}
