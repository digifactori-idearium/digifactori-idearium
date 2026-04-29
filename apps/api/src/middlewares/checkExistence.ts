import { Ideorama, VoxelModel } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import HttpResponse from '@/utils/http-response';

export const checkIdeoramaExistence = (
  req: Request,
  res: Response,
  next: NextFunction,
  getIdeoramaById: (ideoramaId: string) => Promise<Ideorama | null>
): void => {
  getIdeoramaById(req.body.ideoramaId).then(ideorama => {
    if (ideorama) {
      next();
    } else {
      HttpResponse.notFound("L'idéorama que vous cherchez n'existe pas").send(
        res
      );
    }
  });
};

export const checkVoxelModelExistence = (
  req: Request,
  res: Response,
  next: NextFunction,
  getvoxelModelById: (voxelModelId: string) => Promise<VoxelModel | null>
): void => {
  getvoxelModelById(req.body.voxelModelId).then(model => {
    if (model) {
      next();
    } else {
      HttpResponse.notFound("Le modèle voxel que vous cherchez n'existe pas").send(
        res
      );
    }
  });
};
