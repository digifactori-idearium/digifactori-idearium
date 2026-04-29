import fs from 'fs';
import path from 'path';

import { Request, Response } from 'express';

import { IVoxelService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

/**
 * Helper function to get the file path for a voxel model
 *
 * @description Generates and validates the upload path for a voxel model file.
 * Ensures the ID is alphanumeric to prevent path traversal attacks
 *
 * @param {string} voxelModelId - The unique identifier for the voxel model
 * @returns {string} The absolute file path for the voxel model JSON file
 * @throws {Error} If voxelModelId contains invalid characters
 */
const getUploadPath = (voxelModelId: string): string => {
  const id = String(voxelModelId);

  if (!/^[a-z0-9]+$/i.test(id)) {
    throw new Error('Invalid voxelModelId');
  }

  const fileName = `model-${id}.json`;
  return path.join(process.cwd(), 'uploads/voxel-models', fileName);
};

export default class VoxelController {
  constructor(private readonly voxelService: IVoxelService) {}

  /**
   * Creates a new voxel model or updates an existing one
   *
   * @description Creates a new voxel model with an empty template if voxelModelId is not provided.
   * If updating (voxelModelId provided), persists the model data to the file system
   *
   * @param {Request} req - Express request with authenticated user and body containing:
   *   - voxelModelId?: string (if updating)
   *   - voxelModel: { name?: string, model?: object }
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  saveVoxelModelController = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user!;
      console.log("controller");

      if (!req.body.voxelModelId) {
        // Create new voxel model
        const newVoxelModel = await this.voxelService.createVoxelModel({
          name: req.body.voxelModel?.name,
          userId: user.userId,
        });

        const uploadPath = getUploadPath(newVoxelModel.id);
        await this.voxelService.updateVoxelModelPath(
          newVoxelModel.id,
          uploadPath
        );

        const emptyModel = fs.readFileSync(
          path.join(process.cwd(), 'uploads/voxel-models', 'model-empty.json'),
          'utf-8'
        );

        fs.writeFileSync(uploadPath, emptyModel);

        return HttpResponse.created(
          newVoxelModel,
          'Voxel model créé avec succès'
        ).send(res);
      }

      // Update existing voxel model
      const uploadPath = getUploadPath(req.body.voxelModelId);
      console.log("model: ", req.body.model)
      fs.writeFileSync(uploadPath, req.body.model);

      HttpResponse.success(null, 'Voxel model mis à jour avec succès').send(
        res
      );
    }
  );

  /**
   * Retrieves a voxel model by ID with its model data loaded from file
   *
   * @description Fetches a voxel model by ID and loads the associated 3D model data from the file system.
   * Ensures the authenticated user can only access their own models
   *
   * @param {Request} req - Express request with authenticated user and voxelModelId in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  getVoxelModelByIdController = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user!;

      const voxelModel = await this.voxelService.getVoxelModelById(
        req.body.voxelModelId,
        user.userId
      );

      if (!voxelModel) {
        return HttpResponse.notFound('Voxel model introuvable').send(res);
      }

      const fileContent = fs.readFileSync(voxelModel.model, 'utf-8');

      HttpResponse.success(
        {
          ...voxelModel,
          model: JSON.parse(fileContent),
        },
        'Voxel model récupéré avec succès'
      ).send(res);
    }
  );

  /**
   * Retrieves all voxel models belonging to the authenticated user
   *
   * @description Fetches all voxel models created by the authenticated user
   *
   * @param {Request} req - Express request with authenticated user
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  getUserVoxelModelsController = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user;

      if (!user) {
        return HttpResponse.unAuthorized(
          "Vous n'avez pas les droits d'accès"
        ).send(res);
      }

      const voxelModels = await this.voxelService.getUserVoxelModels(
        user.userId
      );

      HttpResponse.success(
        voxelModels,
        'Voxel models récupérés avec succès'
      ).send(res);
    }
  );

  /**
   * Deletes a voxel model and its associated file
   *
   * @description Permanently removes a voxel model from the database and deletes its associated file from the file system.
   * Only allows deletion of models owned by the authenticated user
   *
   * @param {Request} req - Express request with authenticated user and voxelModelId in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  deleteVoxelModelController = asyncHandler(
    async (req: Request, res: Response) => {

      const user = req.user!;

      const uploadPath = getUploadPath(req.body.voxelModelId);

      await this.voxelService.deleteVoxelModel(
        req.body.voxelModelId,
        user.userId
      );

      fs.unlink(uploadPath, err => {
        if (err) {
          console.log(err);
        }
      });

      HttpResponse.deleted('Voxel model supprimé avec succès').send(res);
    }
  );
}
