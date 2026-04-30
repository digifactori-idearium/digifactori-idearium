import { Ideorama, VoxelModel } from '@prisma/client';
import type { NextFunction, Response } from 'express';

import HttpResponse from '@/utils/http-response';

export const checkIdeoramaExistence = async (
  ideoramaId: string,
  res: Response,
  next: NextFunction,
  getIdeoramaById: (ideoramaId: string) => Promise<Ideorama | null>
): Promise<void> => {
  try {
    const ideorama = await getIdeoramaById(ideoramaId);
    if (ideorama) {
      next();
    } else {
      HttpResponse.notFound("L'idéorama que vous cherchez n'existe pas").send(
        res
      );
    }
  } catch (error) {
    next(error);
  }
};

export const checkVoxelModelExistence = async (
  voxelModelId: string,
  res: Response,
  next: NextFunction,
  getvoxelModelById: (voxelModelId: string) => Promise<VoxelModel | null>
): Promise<void> => {
  try {
    const model = await getvoxelModelById(voxelModelId);
    if (model) {
      next();
    } else {
      HttpResponse.notFound(
        "Le modèle voxel que vous cherchez n'existe pas"
      ).send(res);
    }
  } catch (error) {
    next(error);
  }
};
