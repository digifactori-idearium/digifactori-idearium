import { Request, RequestHandler, Response } from 'express';

import { IIdeoramaService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { deleteFile, uploadFile } from '@/utils/storage.service';

const UPLOAD_DIR = 'scenes';

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
  constructor(private readonly ideoramaService: IIdeoramaService) {}

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
   * Returns all ideoramas for a particular user.
   *
   * @route  GET /ideorama
   * @access Authenticated
   */
  getParticularUserIdeoramasController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideoramas = await this.ideoramaService.getUserIdeoramas(
        req.params.userId as string
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
   * Saves the ideorama.
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

    const rawMeta = req.body?.meta;
    const meta: { name?: string; isPublic?: boolean } = rawMeta
      ? typeof rawMeta === 'string'
        ? JSON.parse(rawMeta)
        : rawMeta
      : {};

    const sceneFile = req.file ?? null;

    if (!sceneFile) {
      return HttpResponse.badRequest('Fichier de la scene manquant').send(res);
    }

    const ideorama = await this.ideoramaService.getIdeoramaById(ideoramaId);

    if (ideorama?.scene) {
      await deleteFile(ideorama.scene).catch(() => {});
    }

    const fileKey = await uploadFile(
      {
        ...sceneFile,
        originalname: `${ideoramaId}.json`,
        mimetype: 'application/json',
      },
      UPLOAD_DIR,
      ideoramaId
    );

    await this.ideoramaService.saveScene(ideoramaId, fileKey, meta);

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
  likeIdeoramaController = asyncHandler(async (req, res) => {
    const ideoramaId = req.params.ideoramaId as string;

    const result = await this.ideoramaService.likeIdeorama(
      ideoramaId,
      req.user!.userId
    );

    HttpResponse.success(result).send(res);
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

      const ideorama = await this.ideoramaService.getIdeoramaById(ideoramaId);

      if (ideorama?.scene) {
        await deleteFile(ideorama.scene).catch(() => {});
      }

      await this.ideoramaService.deleteIdeorama(ideoramaId);
      HttpResponse.deleted('Idéorama supprimé avec succès').send(res);
    }
  );
}
