import { Ideorama, Prisma } from '@prisma/client';

import { prisma } from '../../config/client.config';

import { IIdeoramaService } from '@/types';

const ideoramaTable = prisma.ideorama;
const ideoramaLikeTable = prisma.ideoramaLikes;

export default class IdeoramaService implements IIdeoramaService {
  /**
   * Creates a new ideorama with an empty scene.
   */
  async createIdeorama(ideoramaData: Partial<Ideorama>): Promise<Ideorama> {
    return await ideoramaTable.create({
      data: {
        name: ideoramaData.name ?? 'New Ideorama',
        userId: ideoramaData.userId!,
        scene: '',
      },
    });
  }

  /**
   * Saves the scene JSON and optionally syncs metadata fields (name, isPublic)
   * to the DB row so the DB and scene stay in sync.
   */
  async saveScene(
    ideoramaId: string,
    scene: string,
    meta?: { name?: string; isPublic?: boolean }
  ): Promise<Ideorama> {
    return await ideoramaTable.update({
      where: { id: ideoramaId },
      data: { scene, ...meta },
    });
  }

  /**
   * Finds an ideorama by ID (includes like count).
   */
  async getIdeoramaById(ideoramaId: string): Promise<Ideorama | null> {
    return await ideoramaTable.findFirst({
      where: { id: ideoramaId },
      include: {
        _count: { select: { likers: true } },
      },
    });
  }

  /**
   * Finds all ideoramas.
   */
  async getIdeoramas(): Promise<Ideorama[]> {
    return await ideoramaTable.findMany({
      include: {
        _count: { select: { likers: true } },
        likers: { select: { userId: true } },

        user: {
          include: {
            profile: {
              select: {
                id: true,
                pseudo: true,
                avatar: true,
                ideoramaLiked: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds all ideoramas belonging to a user.
   */
  async getUserIdeoramas(userId: string): Promise<Ideorama[]> {
    return ideoramaTable.findMany({
      where: { userId },
      include: {
        _count: { select: { likers: true } },

        likers: userId
          ? {
              where: { userId },
              select: { userId: true },
            }
          : false,
        user: {
          include: {
            profile: {
              select: {
                id: true,
                pseudo: true,
                avatar: true,
                ideoramaLiked: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generic update for ideorama metadata fields.
   */
  async updateIdeorama(
    ideoramaId: string,
    data: Prisma.IdeoramaUpdateInput
  ): Promise<Ideorama> {
    return await ideoramaTable.update({
      where: { id: ideoramaId },
      data,
    });
  }

  /**
   * Updates the scene storage key for an ideorama.
   */
  async updateIdeoramaFileKey(
    ideoramaId: string,
    fileKey: string
  ): Promise<Ideorama> {
    return await ideoramaTable.update({
      where: { id: ideoramaId },
      data: { scene: fileKey },
    });
  }

  /**
   * Checks whether an ideorama exists.
   */
  async isIdeoramaInBD(ideoramaId: string): Promise<boolean> {
    const ideorama = await ideoramaTable.findUnique({
      where: { id: ideoramaId },
    });
    return !!ideorama;
  }

  /**
   * Toggles the like on an ideorama for a user.
   */
  async likeIdeorama(ideoramaId: string, userId: string) {
    const existing = await ideoramaLikeTable.findUnique({
      where: {
        ideoramaId_userId: { ideoramaId, userId },
      },
    });

    if (existing) {
      await ideoramaLikeTable.delete({
        where: {
          ideoramaId_userId: { ideoramaId, userId },
        },
      });
    } else {
      await ideoramaLikeTable.create({
        data: { ideoramaId, userId },
      });
    }

    const count = await ideoramaLikeTable.count({
      where: { ideoramaId },
    });

    return {
      isLiked: !existing,
      likersCount: count,
    };
  }

  /**
   * Permanently deletes an ideorama.
   */
  async deleteIdeorama(ideoramaId: string): Promise<Ideorama> {
    return await ideoramaTable.delete({
      where: { id: ideoramaId },
    });
  }
}
