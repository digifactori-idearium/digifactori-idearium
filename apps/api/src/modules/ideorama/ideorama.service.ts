import { Ideorama, Prisma } from '@prisma/client';

import { prisma } from '../../config/client.config';

import { IIdeoramaService } from '@/types';

const ideoramaTable = prisma.ideorama;
const ideoramaLikeTable = prisma.ideoramaLikes;

export default class IdeoramaService implements IIdeoramaService {
  /**
   * Creates a new ideorama with an empty scene.
   *
   * @params ideoramaData - Partial ideorama data (must include userId, name is optional) (Partial<Ideorama>)
   * @returns The created ideorama as Promise<Ideorama>
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
   * The actual scene file is handled separately in the storage service, this method only updates the DB record with the new storage key and metadata.
   *
   * @param ideoramaId - the id of the ideorama to update (string)
   * @param scene - the scene JSON to save (stringified) (string)
   * @param meta - optional metadata to sync to the DB row (e.g. name, isPublic) ({ name?: string; isPublic?: boolean })
   * @returns The updated ideorama as Promise<Ideorama>
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
   *
   * @params ideoramaId - the id of the ideorama to find (string)
   * @returns The found ideorama with like count as Promise<Ideorama>, or Promise<null> if not found
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
   *
   * @returns An array of all ideoramas including user, like counts and likers as Promise<Ideorama[]>
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
   *
   * @params userId - the id of the user whose ideoramas to find (string)
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
   *
   * @params ideoramaId - the id of the ideorama to update (string)
   * @params data - the fields to update (Prisma.IdeoramaUpdateInput)
   * @returns The updated ideorama as Promise<Ideorama>
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
   *
   * @params ideoramaId - the id of the ideorama to update (string)
   * @params fileKey - the new storage key for the ideorama scene (string)
   * @returns The updated ideorama as Promise<Ideorama>
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
   *
   * @params ideoramaId - the id of the ideorama to check (string)
   * @returns Promise<true> if the ideorama exists, Promise<false> otherwise
   */
  async isIdeoramaInBD(ideoramaId: string): Promise<boolean> {
    const ideorama = await ideoramaTable.findUnique({
      where: { id: ideoramaId },
    });
    return !!ideorama;
  }

  /**
   * Toggles the like on an ideorama for a user.
   *
   * @params ideoramaId - the id of the ideorama to like/unlike (string)
   * @params userId - the id of the user liking/unliking the ideorama (string)
   * @returns An object containing whether the ideorama is now liked and the total like count as Promise<{ isLiked: boolean; likersCount: number }>
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
   *
   * @params ideoramaId - the id of the ideorama to delete (string)
   * @returns The deleted ideorama as Promise<Ideorama>
   * @throws an error if the ideorama is not found
   */
  async deleteIdeorama(ideoramaId: string): Promise<Ideorama> {
    return await ideoramaTable.delete({
      where: { id: ideoramaId },
    });
  }
}
