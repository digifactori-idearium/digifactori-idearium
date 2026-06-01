import { prisma } from '@/config/client.config';
import { IIdeaService } from '@/types';

const ideaTable = prisma.ideas;

export default class IdeaService implements IIdeaService {
  /**
   * Gets the ideas of the user.
   *
   * @param userId - the user id (string)
   * @returns the user'ideas (Ideas) if found, otherwise an object with empty arrays for todo, progress and done
   */
  async getIdeas(userId: string) {
    const ideas = await ideaTable.findFirst({
      where: { userId },
    });

    return (
      ideas?.data || {
        todo: [],
        progress: [],
        done: [],
      }
    );
  }

  /**
   * Updates if exist or creates the ideas of the user.
   *
   * @param userId - the user id (string)
   * @param data - the ideas data to save (Ideas)
   * @returns the user'ideas (Ideas) if found, otherwise an object with empty arrays for todo, progress and done
   */
  async saveIdeas(userId: string, data: any) {
    const existing = await ideaTable.findFirst({
      where: { userId },
    });

    if (existing) {
      return ideaTable
        .update({
          where: { id: existing.id },
          data: { data },
        })
        .then(res => res.data);
    }

    return ideaTable
      .create({
        data: {
          userId,
          data,
        },
      })
      .then(res => res.data);
  }
}
