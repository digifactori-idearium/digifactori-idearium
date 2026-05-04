import { type Request, type Response } from 'express';

import {
  createAssetSchema,
  createBulkAssetsSchema,
  updateAssetSchema,
  listAssetsQuerySchema,
  bulkDeleteAssetsSchema,
} from './asset.validation';

import { IAssetService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import { getFieldsMap, extractFile, extractFiles } from '@/utils/file';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

export default class AssetController {
  constructor(private readonly assetService: IAssetService) {}

  /**
   * Returns a paginated, filtered list of assets.
   *
   * @route  GET /assets
   * @access Authenticated
   *
   * @query  { category?, search?, tags? (CSV), page?, limit? }
   *
   * @returns 200 { data: { items, total, page, limit, totalPages } }
   */
  getAssets = asyncHandler(async (req: Request, res: Response) => {
    const result = await listAssetsQuerySchema.safeParseAsync(req.query);
    if (failOnValidation(result, res)) return;

    const assets = await this.assetService.getAssets(result.data!);
    HttpResponse.success(assets, 'Assets récupérés avec succès').send(res);
  });

  /**
   * Returns a single asset by ID.
   *
   * @route  GET /assets/:assetId
   * @access Authenticated
   *
   * @returns 200 { data: Asset } | 404
   */
  getAssetById = asyncHandler(async (req: Request, res: Response) => {
    const assetId = String(req.params.assetId);

    try {
      const asset = await this.assetService.getAssetById(assetId);
      HttpResponse.success(asset, 'Asset récupéré avec succès').send(res);
    } catch (error: any) {
      if (error.message.includes('introuvable')) {
        return HttpResponse.notFound('Asset introuvable').send(res);
      }
      throw error;
    }
  });

  /**
   * Creates a single asset.
   * The file is uploaded to the configured store or to src/uploads/ in dev.
   *
   * @route  POST /assets
   * @access ADMIN
   *
   * @body   multipart/form-data
   *   file        {File}   required
   *   thumbnail   {File}   optional
   *   name        {string} required
   *   category    {string} required — MODEL_3D | SOUND | IMAGE | OTHER
   *   assetType   {string} optional — ANIMALS | NATURE | BUILDINGS | … (defaults to OTHER)
   *   tags        {string} optional — JSON array e.g. '["tag1","tag2"]'
   *
   * @returns 201 { data: Asset } | 400
   */
  createAsset = asyncHandler(async (req: Request, res: Response) => {
    const map = getFieldsMap(req);

    const mainFile = extractFile(map, 'file');
    if (!mainFile) {
      return HttpResponse.badRequest('Le fichier est requis').send(res);
    }

    const result = await createAssetSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const asset = await this.assetService.createAsset({
      ...result.data!,
      file: mainFile,
      thumbnail: extractFile(map, 'thumbnail'),
    });

    HttpResponse.created(asset, 'Asset créé avec succès').send(res);
  });

  /**
   * Creates multiple assets in one request (partial success supported).
   *
   * @route  POST /assets/bulk
   * @access ADMIN
   *
   * @body   multipart/form-data
   *   files[]       {File[]}  required — up to 50
   *   thumbnails[]  {File[]}  optional
   *   data          {string}  required — JSON array:
   *     [{ name, category, tags?, fileIndex, thumbnailIndex? }, ...]
   *
   * @returns
   *   207 { data: { succeeded: Asset[], failed: { index, name, reason }[] } }
   */
  bulkCreateAssets = asyncHandler(async (req: Request, res: Response) => {
    const map = getFieldsMap(req);

    const files = extractFiles(map, 'files');
    const thumbnails = extractFiles(map, 'thumbnails');

    if (files.length === 0) {
      return HttpResponse.badRequest(
        'Au moins un fichier est requis pour la création en masse'
      ).send(res);
    }

    const result = await createBulkAssetsSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const descriptors = result.data!.data;

    const outOfRange = descriptors.filter(d => d.fileIndex >= files.length);
    if (outOfRange.length > 0) {
      return HttpResponse.badRequest(
        `fileIndex hors limites pour: ${outOfRange.map(d => d.name).join(', ')}`
      ).send(res);
    }

    const bulkResult = await this.assetService.bulkCreateAssets(
      descriptors,
      files,
      thumbnails
    );

    res
      .status(207)
      .json(
        HttpResponse.success(
          bulkResult,
          `${bulkResult.succeeded.length} asset(s) créé(s), ${bulkResult.failed.length} échec(s)`
        ).toJson()
      );
  });

  /**
   * Partially updates an asset. Optionally replaces file / thumbnail.
   *
   * @route  PATCH /assets/:assetId
   * @access ADMIN
   *
   * @body   multipart/form-data OR application/json
   *   file?       {File}
   *   thumbnail?  {File}
   *   name?       {string}
   *   category?   {string}
   *   tags?       {string} JSON array
   *
   * @returns 200 { data: Asset } | 400 | 404
   */
  updateAsset = asyncHandler(async (req: Request, res: Response) => {
    const assetId = String(req.params.assetId);
    const map = getFieldsMap(req);

    const result = await updateAssetSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    try {
      const asset = await this.assetService.updateAsset(assetId, {
        ...result.data!,
        file: extractFile(map, 'file'),
        thumbnail: extractFile(map, 'thumbnail'),
      });
      HttpResponse.success(asset, 'Asset mis à jour avec succès').send(res);
    } catch (error: any) {
      if (error.message.includes('introuvable')) {
        return HttpResponse.notFound('Asset introuvable').send(res);
      }
      throw error;
    }
  });

  /**
   * Permanently deletes an asset and its files from storage.
   *
   * @route  DELETE /assets/:assetId
   * @access ADMIN
   *
   * @returns 204 | 404
   */
  deleteAsset = asyncHandler(async (req: Request, res: Response) => {
    const assetId = String(req.params.assetId);

    try {
      await this.assetService.deleteAsset(assetId);
      HttpResponse.deleted('Asset supprimé avec succès').send(res);
    } catch (error: any) {
      if (error.message.includes('introuvable')) {
        return HttpResponse.notFound('Asset introuvable').send(res);
      }
      throw error;
    }
  });

  /**
   * Permanently deletes multiple assets (partial success supported).
   *
   * @route  DELETE /assets/bulk
   * @access ADMIN
   *
   * @body   application/json { ids: string[] }
   *
   * @returns 207 { data: { deleted: number, failed: { id, reason }[] } }
   */
  bulkDeleteAssets = asyncHandler(async (req: Request, res: Response) => {
    const result = await bulkDeleteAssetsSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const bulkResult = await this.assetService.bulkDeleteAssets(
      result.data!.ids
    );

    res
      .status(207)
      .json(
        HttpResponse.success(
          bulkResult,
          `${bulkResult.deleted} asset(s) supprimé(s), ${bulkResult.failed.length} échec(s)`
        ).toJson()
      );
  });
}
