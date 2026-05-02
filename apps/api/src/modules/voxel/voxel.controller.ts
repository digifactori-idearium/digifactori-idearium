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
   * Creates a new voxel model or updates an existing one with model data.
   *
   * @route  POST /voxel/save
   * @access Authenticated
   *
   * @body   { voxelModelId?: string, voxelModel: { name?: string, model?: object } }
   *
   * @returns
   *   - 201 { data: VoxelModel } (on creation)
   *   - 200 { data: null } (on update)
   *   - 404 voxel model not found (on update)
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
   * Retrieves a voxel model by ID with its associated 3D model data.
   *
   * @route  POST /voxel
   * @access Authenticated
   *
   * @body   { voxelModelId: string }
   *
   * @returns
   *   - 200 { data: VoxelModel }
   *   - 404 voxel model not found
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
   * Retrieves all voxel models belonging to the authenticated user.
   *
   * @route  POST /voxel/all
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: VoxelModel[] }
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
   * Deletes a voxel model and its associated file from storage.
   *
   * @route  POST /voxel/delete
   * @access Authenticated
   *
   * @body   { voxelModelId: string }
   *
   * @returns
   *   - 200 { data: null }
   *   - 404 voxel model not found
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
