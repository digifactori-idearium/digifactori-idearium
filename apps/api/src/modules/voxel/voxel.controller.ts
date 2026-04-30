import fs from 'fs';
import path from 'path';

import { Request, Response } from 'express';

import { IVoxelService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { uploadFile, deleteFile } from '@/utils/storage.service';

const UPLOAD_DIR = 'voxel-models';

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

      //  CREATE
      if (!req.body.voxelModelId) {
        const newVoxelModel = await this.voxelService.createVoxelModel({
          name: req.body.voxelModel?.name,
          userId: user.userId,
        });

        const emptyModelBuffer = fs.readFileSync(
          path.join(process.cwd(), 'uploads/voxel-models', 'model-empty.json'),
          'utf-8'
        );

        const file = {
          buffer: Buffer.from(emptyModelBuffer),
          originalname: `model-${newVoxelModel.id}.json`,
          size: emptyModelBuffer.length,
          mimetype: 'application/json',
        } as any;

        const fileKey = await uploadFile(file, UPLOAD_DIR, newVoxelModel.id);
        await this.voxelService.updateVoxelModelFileKey(
          newVoxelModel.id,
          fileKey
        );

        return HttpResponse.created(
          newVoxelModel,
          'Voxel model créé avec succès'
        ).send(res);
      }

      // UPDATE
      const voxelModel = await this.voxelService.getVoxelModelById(
        req.body.voxelModelId,
        user.userId
      );

      if (!voxelModel) {
        return HttpResponse.notFound('Voxel model not found').send(res);
      }

      // Delete previous JSON voxel file
      if (voxelModel.model) {
        await deleteFile(voxelModel.model).catch(() => {});
      }

      // Save JSON voxel data
      const modelJson =
        typeof req.body.model === 'string'
          ? req.body.model
          : JSON.stringify(req.body.model ?? []);

      const jsonFile = {
        buffer: Buffer.from(modelJson),
        originalname: `model-${req.body.voxelModelId}.json`,
        size: modelJson.length,
        mimetype: 'application/json',
      } as any;

      const jsonFileKey = await uploadFile(
        jsonFile,
        UPLOAD_DIR,
        req.body.voxelModelId
      );

      // Save GLB file if provided
      const glbFile = (req.files as any)?.glb?.[0] ?? req.files ?? null;
      if (glbFile) {
        // Delete previous GLB if it exists
        const glbKey = `${UPLOAD_DIR}/${req.body.voxelModelId}.glb`;
        await deleteFile(glbKey).catch(() => {});

        await uploadFile(
          {
            ...glbFile,
            originalname: `${req.body.voxelModelId}.glb`,
            mimetype: 'model/gltf-binary',
          },
          UPLOAD_DIR,
          `${req.body.voxelModelId}-glb`
        );
      }

      await this.voxelService.updateVoxelModelFileKey(
        req.body.voxelModelId,
        jsonFileKey
      );

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

      HttpResponse.success(voxelModel, 'Voxel model récupéré avec succès').send(
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

      const voxelModel = await this.voxelService.getVoxelModelById(
        req.body.voxelModelId,
        user.userId
      );

      if (!voxelModel) {
        return HttpResponse.notFound('Voxel model not found').send(res);
      }

      // Delete the file from storage
      if (voxelModel.model) {
        await deleteFile(voxelModel.model).catch(() => {
          // Ignore error if file doesn't exist
        });
      }

      // Delete from DB
      await this.voxelService.deleteVoxelModel(
        req.body.voxelModelId,
        user.userId
      );

      HttpResponse.deleted('Voxel model supprimé avec succès').send(res);
    }
  );
}
