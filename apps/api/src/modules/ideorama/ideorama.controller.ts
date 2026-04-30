import fs from 'fs';

import { Request, RequestHandler, Response } from 'express';

import IdeoramaService from './ideorama.services';

import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { uploadFile, deleteFile } from '@/utils/storage.service';

const UPLOAD_DIR = 'scenes';

export default class IdeoramaController {
  constructor(private readonly ideoramaService: IdeoramaService) {}

  /**
   * Creates a new ideorama project
   *
   * @description Creates a new ideorama record in the database.
   * Does not automatically create or initialize the scene file
   *
   * @param {Request} req - Express request with ideorama data in body: { ideorama: Object }
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  createIdeoramaController = asyncHandler(
    async (req: Request, res: Response) => {
      // Save in DB
      const newIdeorama = await this.ideoramaService.createIdeorama(
        req.body.ideorama
      );

      // Upload empty scene template to storage
      const emptySceneBuffer = fs.readFileSync(
        'uploads/scenes/scene-empty.json'
      );
      const file = {
        buffer: emptySceneBuffer,
        originalname: `scene-${newIdeorama.id}.json`,
        size: emptySceneBuffer.length,
        mimetype: 'application/json',
      } as any;

      const fileKey = await uploadFile(file, UPLOAD_DIR, newIdeorama.id);

      // Store the storage key in DB
      await this.ideoramaService.updateIdeoramaModelFileKey(
        newIdeorama.id,
        fileKey
      );

      HttpResponse.created(newIdeorama, 'Idéorama créé avec succès').send(res);
    }
  );

  /**
   * Retrieves all ideoramas of the user
   *
   * @description Fetches all ideorama projects created by the user
   *
   * @param {Request} req - Express request with userId in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
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
   * Retrieves a specific ideorama with its scene data loaded from file
   *
   * @description Fetches a single ideorama by ID and loads the associated scene model data from the file system.
   * Ensures the authenticated user can only access their own ideoramas
   *
   * @param {Request} req - Express request with authenticated user and ideoramaId in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  getIdeoramaByIdController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideorama = await this.ideoramaService.getIdeoramaById(
        req.body.ideoramaId
      );

      if (!ideorama) {
        return HttpResponse.notFound('Ideorama not found').send(res);
      }

      // The fileKey is stored in ideorama.model
      // Frontend can fetch the actual scene data via /api/storage/file/{fileKey}
      return HttpResponse.success(
        ideorama,
        'Ideorama retrieved successfully'
      ).send(res);
    }
  );

  /**
   * Updates an ideorama and its scene model
   *
   * @description Persists the scene data to the file system
   *
   * @param {Request} req - Express request with authenticated user and body containing:
   *   - ideoramaId: string
   *   - ideorama: { model: string (JSON) }
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  saveIdeoramaController = asyncHandler(async (req: Request, res: Response) => {
    const ideorama = await this.ideoramaService.getIdeoramaById(
      req.body.ideoramaId
    );

    if (!ideorama) {
      return HttpResponse.notFound('Ideorama not found').send(res);
    }

    // Create buffer from model JSON
    const modelJson =
      typeof req.body.ideorama.model === 'string'
        ? req.body.ideorama.model
        : JSON.stringify(req.body.ideorama.model);

    const file = {
      buffer: Buffer.from(modelJson),
      originalname: `scene-${req.body.ideoramaId}.json`,
      size: modelJson.length,
      mimetype: 'application/json',
    } as any;

    // If fileKey already exists, delete old file first
    if (ideorama.model) {
      await deleteFile(ideorama.model).catch(() => {
        // Ignore error if file doesn't exist
      });
    }

    // Upload new version
    const fileKey = await uploadFile(file, UPLOAD_DIR, req.body.ideoramaId);

    // Update DB with new fileKey
    await this.ideoramaService.updateIdeoramaModelFileKey(
      req.body.ideoramaId,
      fileKey
    );

    HttpResponse.success(null, 'Ideorama updated successfully').send(res);
  });

  /**
   * Updates the like status of an ideorama for the authenticated user
   *
   * @description Toggles the like status of an ideorama for the authenticated user. If the user has already liked the ideorama, it will remove the like; otherwise, it will add a like.
   *
   * @param {Request} req - Express request with authenticated user and body containing:
   *   - ideoramaId: string
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  likeIdeoramaController = asyncHandler(async (req: Request, res: Response) => {
    await this.ideoramaService.likeIdeorama(
      req.body.ideoramaId,
      req.user!.userId
    );

    return HttpResponse.success(null, 'Ideorama liked successfully').send(res);
  });

  /**
   * Deletes an ideorama and its associated scene file
   *
   * @description Permanently removes an ideorama from the database and deletes its associated scene file from the file system.
   * Only allows deletion of ideoramas owned by the authenticated user
   *
   * @param {Request} req - Express request with authenticated user and ideoramaId in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  deleteIdeoramaController = asyncHandler(
    async (req: Request, res: Response) => {
      const ideorama = await this.ideoramaService.getIdeoramaById(
        req.body.ideoramaId
      );

      if (!ideorama) {
        return HttpResponse.notFound('Ideorama not found').send(res);
      }

      // Delete the file from storage
      if (ideorama.model) {
        await deleteFile(ideorama.model).catch(() => {
          // Ignore error if file doesn't exist
        });
      }

      // Delete from DB
      await this.ideoramaService.deleteIdeorama(req.body.ideoramaId);

      return HttpResponse.deleted('Ideorama deleted successfully').send(res);
    }
  );

  /**
   * Retrieves the empty ideorama template
   *
   * @description Returns the empty scene template used for new ideorama projects.
   * This template serves as the baseline structure for creating new scenes
   *
   * @param {Request} req - Express request
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  getEmptyIdeorama: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const emptyModel = JSON.parse(
        fs.readFileSync('uploads/scenes/scene-empty.json', 'utf-8')
      );
      HttpResponse.success(emptyModel, 'Empty ideorama template').send(res);
    }
  );
}
