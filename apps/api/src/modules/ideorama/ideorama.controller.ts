import fs from 'fs';

import { Request, RequestHandler, Response } from 'express';

import IdeoramaService from './ideorama.services';

import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { getUploadPath } from '@/utils/ideorama';

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
      const uploadPath = getUploadPath(newIdeorama.id);
      await this.ideoramaService.updateIdeoramaModelPath(
        newIdeorama.id,
        uploadPath
      );

      // Save in uploads dir
      const emptyScene = fs.readFileSync('uploads/scenes/scene-empty.json');
      fs.writeFileSync(uploadPath, emptyScene);

      HttpResponse.created(newIdeorama, 'Idéorama créé avec succès').send(res);
    }
  );

  /**
   * Retrieves all ideoramas for the authenticated user with profile info
   *
   * @description Fetches all ideorama projects created by the authenticated user
   * and includes the user's profile information in the response
   *
   * @param {Request} req - Express request with authenticated user (req.user)
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
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

      const fileContent = fs.readFileSync(ideorama.model, 'utf-8');
      ideorama.model = JSON.parse(fileContent);

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
    const uploadPath = getUploadPath(req.body.ideoramaId);
    fs.writeFileSync(uploadPath, req.body.ideorama.model);

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
      await this.ideoramaService.deleteIdeorama(req.body.ideoramaId);
      const uploadPath = getUploadPath(req.body.ideoramaId);

      fs.unlink(uploadPath, err => {
        if (err) console.log(err);
      });

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
        fs.readFileSync(getUploadPath('empty'), 'utf-8')
      );
      HttpResponse.success(emptyModel, 'Empty ideorama template').send(res);
    }
  );
}
