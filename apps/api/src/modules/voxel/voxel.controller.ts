import { Request, Response } from 'express';

import { IVoxelService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { uploadFile, deleteFile } from '@/utils/storage.service';

const UPLOAD_DIR = 'voxel-models';

export default class VoxelController {
  constructor(private readonly voxelService: IVoxelService) {}

  /**
   * Creates a new empty voxel model (no file yet).
   *
   * @route  POST /voxel
   * @access Authenticated
   *
   * @body   { name?: string }
   *
   * @returns 201 { data: VoxelModel }
   */
  createVoxelModel = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    const newVoxelModel = await this.voxelService.createVoxelModel({
      name: req.body.name,
      userId: user.userId,
    });

    return HttpResponse.created(
      newVoxelModel,
      'Voxel model créé avec succès'
    ).send(res);
  });

  /**
   * Saves (overwrites) the GLB file for an existing voxel model.
   * The previous GLB is deleted before the new one is uploaded.
   * Existence is pre-checked by the checkVoxelModelExistence middleware.
   *
   * @route  PATCH /voxel/:voxelModelId/save
   * @access Authenticated
   *
   * @params voxelModelId
   * @files  { file: GLB }
   *
   * @returns
   *   200 { data: null }
   *   400 no GLB file provided
   */
  saveVoxelModel = asyncHandler(async (req: Request, res: Response) => {
    const voxelModelId = req.params.voxelModelId as string;

    const glbFile = req.file ?? null;

    if (!glbFile) {
      return HttpResponse.badRequest('Fichier GLB manquant').send(res);
    }

    const voxelModel = await this.voxelService.getVoxelModelById(voxelModelId);

    if (voxelModel?.model) {
      await deleteFile(voxelModel.model).catch(() => {});
    }

    const fileKey = await uploadFile(
      {
        ...glbFile,
        originalname: `${voxelModelId}.glb`,
        mimetype: 'model/gltf-binary',
      },
      UPLOAD_DIR,
      voxelModelId
    );

    await this.voxelService.updateVoxelModelFileKey(voxelModelId, fileKey);

    HttpResponse.success(null, 'Voxel model sauvegardé avec succès').send(res);
  });

  /**
   * Retrieves a voxel model by ID.
   *
   * @route  GET /voxel/:voxelModelId
   * @access Authenticated
   *
   * @params voxelModelId
   *
   * @returns
   *   200 { data: VoxelModel }
   *   404 voxel model not found
   */
  getVoxelModelById = asyncHandler(async (req: Request, res: Response) => {
    const voxelModelId = req.params.voxelModelId as string;

    const voxelModel = await this.voxelService.getVoxelModelById(voxelModelId);

    if (!voxelModel) {
      return HttpResponse.notFound('Voxel model introuvable').send(res);
    }

    HttpResponse.success(voxelModel, 'Voxel model récupéré avec succès').send(
      res
    );
  });

  /**
   * Retrieves all voxel models belonging to the authenticated user.
   *
   * @route  GET /voxel
   * @access Authenticated
   *
   * @returns 200 { data: VoxelModel[] }
   */
  getUserVoxelModels = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    const voxelModels = await this.voxelService.getUserVoxelModels(user.userId);

    HttpResponse.success(
      voxelModels,
      'Voxel models récupérés avec succès'
    ).send(res);
  });

  /**
   * Retrieves all voxel models.
   *
   * @route  GET /voxel
   * @access Authenticated
   *
   * @returns 200 { data: VoxelModel[] }
   */
  getVoxelModels = asyncHandler(async (req: Request, res: Response) => {
    const voxelModels = await this.voxelService.getVoxelModels();

    HttpResponse.success(
      voxelModels,
      'Voxel models récupérés avec succès'
    ).send(res);
  });

  /**
   * Deletes a voxel model and its GLB file from storage.
   * Existence is pre-checked by the checkVoxelModelExistence middleware.
   *
   * @route  DELETE /voxel/:voxelModelId
   * @access Authenticated
   *
   * @params voxelModelId
   *
   * @returns 200 { data: null }
   */
  deleteVoxelModel = asyncHandler(async (req: Request, res: Response) => {
    const voxelModelId = req.params.voxelModelId as string;

    const voxelModel = await this.voxelService.getVoxelModelById(voxelModelId);

    if (voxelModel?.model) {
      await deleteFile(voxelModel.model).catch(() => {});
    }

    await this.voxelService.deleteVoxelModel(voxelModelId);

    HttpResponse.deleted('Voxel model supprimé avec succès').send(res);
  });
}
