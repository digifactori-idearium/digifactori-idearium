import fs from 'fs';
import path from 'path';

import { Request, Response } from 'express';

import { IVoxelService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import { getVoxelModelUploadPath } from '@/utils/getUploadPath';
import HttpResponse from '@/utils/http-response';

export default class VoxelController {
  constructor(private readonly voxelService: IVoxelService) {}

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
      const voxelModel = await this.voxelService.getVoxelModelById(
        req.body.voxelModelId
      );
      console.log(voxelModel);
      if (!voxelModel) {
        return HttpResponse.notFound('Modèle voxel introuvable').send(res);
      }

      const fileContent = fs.readFileSync(voxelModel.model, 'utf-8');

      console.log(fileContent);
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
   * Creates a new voxel model project
   *
   * @description Creates a new voxel model record in the database.
   * Does not automatically create or initialize the scene file
   *
   * @param {Request} req - Express request with model data in body: { voxelModel: {name: string} }
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  createVoxelModelController = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user!;
      const newVoxelModel = await this.voxelService.createVoxelModel(
        req.body.voxelModel.name,
        user.userId
      );

      const uploadPath = getVoxelModelUploadPath(newVoxelModel.id);
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
  );

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
      const uploadPath = getVoxelModelUploadPath(req.body.voxelModelId);
      fs.writeFileSync(uploadPath, req.body.model);
      HttpResponse.success(null, 'Voxel model mis à jour avec succès').send(
        res
      );
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
      const voxelModels = await this.voxelService.getUserVoxelModels(
        req.user!.userId
      );

      HttpResponse.success(
        voxelModels,
        'Modèles voxel récupérés avec succès'
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
   * @returns {Response}
   */
  deleteVoxelModelController = asyncHandler(
    async (req: Request, res: Response) => {
      const uploadPath = getVoxelModelUploadPath(req.body.voxelModelId);

      await this.voxelService.deleteVoxelModel(req.body.voxelModelId);

      fs.unlink(uploadPath, err => {
        if (err) {
          console.log(err);
        }
      });

      HttpResponse.deleted('Voxel model supprimé avec succès').send(res);
    }
  );
}
