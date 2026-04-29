import { Ideorama } from '@prisma/client';

import { prisma } from '../../config/client.config';

import { IIdeoramaService } from '@/types';

const ideoramaTable = prisma.ideorama;
const ideoramaLikeTable = prisma.ideoramaLikes;

export default class IdeoramaService implements IIdeoramaService {
  /**
   * Finds an ideorama in DB based on its ID.
   *
   * @param ideoramaId - the ideorama id we are searching for
   * @returns
   *  - if found, a Promise with the ideorama (Promise<Ideorama>)
   *  - a Promise with null otherwise (Promise<null>)
   */
  async getIdeoramaById(ideoramaId: string): Promise<Ideorama | null> {
    return ideoramaTable.findFirst({
      where: {
        id: ideoramaId,
      },
      include: {
        _count: {
          select: {
            likers: true,
          },
        },
      },
    });
  }

  /**
   * Creates a new ideorama in DB, with model = "".
   *
   * @param name - the name of the new ideorama
   * @param userId - the id of the user creating the idorama
   * @returns a Promise with the new ideorama (Promise<Ideorama>)
   */
  async createIdeorama(name: string, userId: string): Promise<Ideorama> {
    return await ideoramaTable.create({
      data: { name, userId, model: '' },
    });
  }

  /**
   * Updates the model in BD of the ideorama.
   *
   * @param ideoramaId - the ideorama id to update
   * @param uploadPath - the new model to put in DB
   * @returns a Promise with the updated ideorama (Promise<Ideorama>)
   * @throws error if the ideoramaId does not exist in DB
   */
  async updateIdeoramaModelPath(
    ideoramaId: string,
    uploadPath: string
  ): Promise<Ideorama> {
    return ideoramaTable.update({
      where: {
        id: ideoramaId,
      },
      data: {
        model: uploadPath,
      },
    });
  }

  /**
   * Updates an ideorama from DB with the given ID.
   *
   * @param ideoramaId - the unique id of the ideorama to update
   * @returns a Promise with the updated ideorama (Promise<Ideorama>)
   * @throws error if the ideoramaId does not exist in DB
   */
  async updateIdeorama(ideoramaId: string, data: Ideorama): Promise<Ideorama> {
    return ideoramaTable.update({
      where: {
        id: ideoramaId,
      },
      data,
    });
  }

  /**
   * Finds all ideoramas of a user in DB.
   *
   * @param userId - the user id for which we search for its ideoramas
   * @returns a Promise with the ideoramas (Promise<Ideorama[]>)
   */
  async getUserIdeoramas(userId: string): Promise<Ideorama[]> {
    return ideoramaTable.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: {
            likers: true,
          },
        },
        likers: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  /**
   * Likes an ideorama.
   * @param ideoramaId - the unique id of the ideorama to like
   * @param userId - the unique id of the user who wants to like the ideorama
   * @return Promise<true> if the like/unlike action is successful, Promise<false> otherwise
   * @throws error if the ideoramaId or userId does not exist in DB
   */
  async likeIdeorama(ideoramaId: string, userId: string): Promise<boolean> {
    const like = await ideoramaLikeTable.findFirst({
      where: {
        ideoramaId: ideoramaId,
        userId: userId,
      },
    });
    if (like) {
      await ideoramaLikeTable.delete({
        where: {
          ideoramaId_userId: {
            ideoramaId: ideoramaId,
            userId: userId,
          },
        },
      });
      return true;
    }
    await ideoramaLikeTable.create({
      data: {
        ideoramaId: ideoramaId,
        userId: userId,
      },
    });
    return true;
  }

  /**
   * Deletes an ideorama from DB based on its ID.
   *
   * @param ideoramaId - the unique id of the ideorama to delete
   * @returns a Promise with the deleted ideorama (Promise<Ideorama>)
   * @throws error if the ideoramaId does not exist in DB
   */
  async deleteIdeorama(ideoramaId: string): Promise<Ideorama> {
    const ideorama = await ideoramaTable.delete({
      where: {
        id: ideoramaId,
      },
    });
    return ideorama;
  }
}
