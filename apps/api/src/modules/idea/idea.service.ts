import { prisma } from '@/config/client.config';
import { IIdeaService } from '@/types';

const ideaTable = prisma.idea;

export default class IdeaService implements IIdeaService {

  async getIdeas(userId: string) {
    const ideas = await ideaTable.findMany({
      where: { userId },
    });

    return ideas[0]?.data || {
      todo: [],
      progress: [],
      done: [],
    };
  }

  async saveIdeas(userId: string, data: any) {
    const existing = await ideaTable.findMany({
      where: { userId },
    });

    if (existing.length > 0) {
      return ideaTable.update({
        where: { id: existing[0].id },
        data: { data },
      });
    }

    return ideaTable.create({
      data: {
        userId,
        data,
      },
    });
  }
}