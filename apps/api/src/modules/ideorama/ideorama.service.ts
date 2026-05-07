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
    const emptyScene = {
      global: {
        brightness: 'bright',
        visible: true,
        isPublic: true,
        music: { currentTrack: '', volume: 0.5 },
        theme: 'day',
      },
      background: { color: '#8ecae6', accent: '#8ecae6' },
      info: {
        name: ideoramaData.name ?? 'New Ideorama',
        category: 'none',
      },
      floor: { color: '#53ED83', hidden: false, texture: 'none' },
      objects: {},
    };

    return ideoramaTable.create({
      data: {
        name: ideoramaData.name ?? 'New Ideorama',
        userId: ideoramaData.userId!,
        scene: emptyScene,
      },
    });
  }

  /**
   * Saves the scene JSON and optionally syncs metadata fields (name, isPublic)
   * to the DB row so the DB and scene stay in sync.
   */
  async saveScene(
    ideoramaId: string,
    scene: Prisma.InputJsonValue,
    meta?: { name?: string; isPublic?: boolean }
  ): Promise<Ideorama> {
    return ideoramaTable.update({
      where: { id: ideoramaId },
      data: { scene, ...meta },
    });
  }

  /**
   * Finds an ideorama by ID (includes like count).
   */
  async getIdeoramaById(ideoramaId: string): Promise<Ideorama | null> {
    return ideoramaTable.findFirst({
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
    return ideoramaTable.findMany({
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
    return ideoramaTable.update({
      where: { id: ideoramaId },
      data,
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
