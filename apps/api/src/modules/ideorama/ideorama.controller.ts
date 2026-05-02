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
   * Creates a new ideorama with an empty scene stored directly in the DB.
   *
   * @route  POST /ideorama/create
   * @access Authenticated
   * @body   { ideorama: { name?: string, userId: string } }
   */
  createIdeoramaController = asyncHandler(
    async (req: Request, res: Response) => {
      const newIdeorama = await this.ideoramaService.createIdeorama(
        req.body.ideorama
      );
      HttpResponse.created(newIdeorama, 'Idéorama créé avec succès').send(res);
    }
  );

  /**
   * Returns all ideoramas for a user.
   *
   * @route  POST /ideorama/all
   * @access Authenticated
   * @body   { userId: string }
   */
  getUserIdeoramasController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideoramas = await this.ideoramaService.getUserIdeoramas(
        req.body.userId
      );
      HttpResponse.success(ideoramas, 'Idéoramas récupérés avec succès').send(
        res
      );
    }
  );

  /**
   * Returns a single ideorama with its scene data embedded.
   * The `scene` field is the full scene JSON — no second request needed.
   *
   * @route  POST /ideorama
   * @access Authenticated
   * @body   { ideoramaId: string }
   */
  getIdeoramaByIdController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideorama = await this.ideoramaService.getIdeoramaById(
        req.body.ideoramaId
      );

      if (!ideorama) {
        return HttpResponse.notFound('Ideorama not found').send(res);
      }

      return HttpResponse.success(
        ideorama,
        'Ideorama retrieved successfully'
      ).send(res);
    }
  );

  /**
   * Saves the scene JSON into the DB and syncs `name` + `isPublic`
   * from the scene metadata to the DB row so both stay in sync.
   *
   * @route  POST /ideorama/save
   * @access Authenticated
   * @body   { ideoramaId: string, ideorama: { scene: object | string } }
   */
  saveIdeoramaController = asyncHandler(async (req: Request, res: Response) => {
    const { ideoramaId, ideorama } = req.body;

    const existing = await this.ideoramaService.getIdeoramaById(ideoramaId);
    if (!existing) {
      return HttpResponse.notFound('Ideorama not found').send(res);
    }

    // Accept either a pre-parsed object or a JSON string
    const scene =
      typeof ideorama.scene === 'string'
        ? JSON.parse(ideorama.scene)
        : (ideorama.scene as import('@prisma/client').Prisma.InputJsonValue);

    // Sync name and isPublic from scene.info / scene.global to the DB row
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

    HttpResponse.success(null, 'Ideorama saved successfully').send(res);
  });

  /**
   * Toggles the like on an ideorama for the authenticated user.
   *
   * @route  POST /ideorama/like
   * @access Authenticated
   * @body   { ideoramaId: string }
   */
  likeIdeoramaController = asyncHandler(async (req: Request, res: Response) => {
    await this.ideoramaService.likeIdeorama(
      req.body.ideoramaId,
      req.user!.userId
    );
    return HttpResponse.success(null, 'Ideorama liked successfully').send(res);
  });

  /**
   * Permanently deletes an ideorama.
   *
   * @route  POST /ideorama/delete
   * @access Authenticated
   * @body   { ideoramaId: string }
   */
  deleteIdeoramaController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideorama = await this.ideoramaService.getIdeoramaById(
        req.body.ideoramaId
      );

      if (!ideorama) {
        return HttpResponse.notFound('Ideorama not found').send(res);
      }

      await this.ideoramaService.deleteIdeorama(req.body.ideoramaId);

      return HttpResponse.deleted('Ideorama deleted successfully').send(res);
    }
  );

  /**
   * Returns the empty scene template.
   *
   * @route  GET /ideorama/empty
   * @access Public
   */
  getEmptyIdeorama: RequestHandler = asyncHandler(
    async (_req: Request, res: Response) => {
      HttpResponse.success(EMPTY_SCENE, 'Empty ideorama template').send(res);
    }
  );
}
