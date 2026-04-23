import { prisma } from '@/config/client.config';
import { IIdeaService } from '@/types';

const ideaTable = prisma.idea;

export default class IdeaService implements IIdeaService {
  async createIdea(data: {
    content: string;
    column: 'todo' | 'progress' | 'done';
    priority?: 'high' | 'low';
    color?: string;
    userId: string;
  }) {
    return ideaTable.create({
      data: {
        content: data.content,
        column: data.column,
        priority: data.priority || 'low',
        color: data.color || '#ffffff',
        userId: data.userId,
      },
    });
  }

  async getUserIdeas(userId: string) {
    return ideaTable.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateIdea(ideaId: string, data: any) {
    return ideaTable.update({
      where: { id: ideaId },
      data,
    });
  }

  async deleteIdea(ideaId: string) {
    return ideaTable.delete({
      where: { id: ideaId },
    });
  }
}