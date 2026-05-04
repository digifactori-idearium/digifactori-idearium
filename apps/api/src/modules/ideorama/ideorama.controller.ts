import { Request, RequestHandler, Response } from 'express';

import IdeoramaService from './ideorama.service';

import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

const EMPTY_SCENE = {
  global: {
    brightness: 'bright',
    visible: true,
    isPublic: true,
    music: { currentTrack: '', volume: 0.5 },
    theme: 'day',
  },
  background: { color: '#8ecae6', accent: '#8ecae6' },
  info: { name: 'New Ideorama', category: 'none' },
  floor: { color: '#53ED83', hidden: false, texture: 'none' },
  objects: {},
};

export default class IdeoramaController {
  constructor(private readonly ideoramaService: IdeoramaService) {}

  /**
   * Returns the empty scene template.
   *
   * @route  GET /ideorama/empty
   * @access Authenticated
   */
  getEmptyIdeorama: RequestHandler = asyncHandler(
    async (_req: Request, res: Response) => {
      HttpResponse.success(EMPTY_SCENE, 'Empty ideorama template').send(res);
    }
  );

  /**
   * Returns all ideoramas .
   *
   * @route  GET /ideorama
   * @access Authenticated
   */
  getIdeoramasController = asyncHandler(async (req: Request, res: Response) => {
    const ideoramas = await this.ideoramaService.getIdeoramas();
    HttpResponse.success(ideoramas, 'Idéoramas récupérés avec succès').send(
      res
    );
  });

  /**
   * Returns all ideoramas for the authenticated user.
   *
   * @route  GET /ideorama
   * @access Authenticated
   */
  getUserIdeoramasController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideoramas = await this.ideoramaService.getUserIdeoramas(
        req.user!.userId
      );
      HttpResponse.success(ideoramas, 'Idéoramas récupérés avec succès').send(
        res
      );
    }
  );

  /**
   * Returns a single ideorama with its scene data.
   *
   * @route  GET /ideorama/:ideoramaId
   * @access Authenticated
   *
   * @params ideoramaId
   */
  getIdeoramaByIdController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideoramaId = req.params.ideoramaId as string;

      const ideorama = await this.ideoramaService.getIdeoramaById(ideoramaId);

      if (!ideorama) {
        return HttpResponse.notFound('Idéorama introuvable').send(res);
      }

      HttpResponse.success(ideorama, 'Idéorama récupéré avec succès').send(res);
    }
  );

  /**
   * Creates a new ideorama with an empty scene.
   *
   * @route  POST /ideorama
   * @access Authenticated
   *
   * @body   { name?: string }
   */
  createIdeoramaController = asyncHandler(
    async (req: Request, res: Response) => {
      const newIdeorama = await this.ideoramaService.createIdeorama({
        name: req.body.name,
        userId: req.user!.userId,
      });
      HttpResponse.created(newIdeorama, 'Idéorama créé avec succès').send(res);
    }
  );

  /**
   * Saves the scene JSON into the DB.
   * Syncs name and isPublic from scene metadata to the DB row.
   * Existence is pre-checked by the checkIdeoramaExistence middleware.
   *
   * @route  PATCH /ideorama/:ideoramaId/save
   * @access Authenticated
   *
   * @params ideoramaId
   * @body   { scene: object | string }
   */
  saveIdeoramaController = asyncHandler(async (req: Request, res: Response) => {
    const ideoramaId = req.params.ideoramaId as string;

    const scene =
      typeof req.body.scene === 'string'
        ? JSON.parse(req.body.scene)
        : (req.body.scene as import('@prisma/client').Prisma.InputJsonValue);

    const sceneName = (scene as any)?.info?.name;
    const sceneIsPublic = (scene as any)?.global?.isPublic;

    await this.ideoramaService.saveScene(ideoramaId, scene, {
      ...(typeof sceneName === 'string' && sceneName.trim()
        ? { name: sceneName.trim() }
        : {}),
      ...(typeof sceneIsPublic === 'boolean'
        ? { isPublic: sceneIsPublic }
        : {}),
    });

    HttpResponse.success(null, 'Idéorama sauvegardé avec succès').send(res);
  });

  /**
   * Toggles the like on an ideorama for the authenticated user.
   * Existence is pre-checked by the checkIdeoramaExistence middleware.
   *
   * @route  POST /ideorama/:ideoramaId/like
   * @access Authenticated
   *
   * @params ideoramaId
   */
  likeIdeoramaController = asyncHandler(async (req: Request, res: Response) => {
    const ideoramaId = req.params.ideoramaId as string;

    await this.ideoramaService.likeIdeorama(ideoramaId, req.user!.userId);
    HttpResponse.success(null, 'Idéorama liké avec succès').send(res);
  });

  /**
   * Permanently deletes an ideorama.
   * Existence is pre-checked by the checkIdeoramaExistence middleware.
   *
   * @route  DELETE /ideorama/:ideoramaId
   * @access Authenticated
   *
   * @params ideoramaId
   */
  deleteIdeoramaController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideoramaId = req.params.ideoramaId as string;

      await this.ideoramaService.deleteIdeorama(ideoramaId);
      HttpResponse.deleted('Idéorama supprimé avec succès').send(res);
    }
  );
}
