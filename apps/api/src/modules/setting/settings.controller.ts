import { Role } from '@prisma/client';
import { type Request, type Response } from 'express';

import {
  updateStoreSettingsSchema,
  createIntegrationSchema,
  updateIntegrationSchema,
  updateOrgSettingsSchema,
} from './setting.validation';

import { ISettingsService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { isUrlReachable } from '@/utils/url-validation';
import { failOnValidation } from '@/utils/validation-errors';

export default class SettingsController {
  constructor(private readonly settingsService: ISettingsService) {}

  // Settings (singleton)

  /**
   * Retrieves the application settings.
   * Creates the singleton row with empty defaults if it doesn't exist yet.
   *
   * @route  GET /settings
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: Setting & { integrations: Integration[] } }
   */
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await this.settingsService.getSettings();
    HttpResponse.success(settings, 'Paramètres récupérés avec succès').send(
      res
    );
  });

  /**
   * Updates the store settings (storeName, storeURL, storeKey).
   * storeURL is validated for reachability before saving.
   * At least one field must be provided.
   *
   * @route  PATCH /settings/store
   * @access ADMIN
   *
   * @body   { storeName?: string, storeURL?: string, storeKey?: string }
   *
   * @returns
   *   - 200 { data: Setting & { integrations: Integration[] } }
   *   - 400 validation errors | unreachable store URL or invalid key
   */
  updateStoreSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await updateStoreSettingsSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { storeURL, storeKey } = result.data!;
    if (storeURL || storeKey) {
      const existing = await this.settingsService.getSettings();
      const resolvedUrl = storeURL ?? existing?.storeURL;
      const resolvedKey = storeKey ?? (existing?.storeKey as string);

      if (resolvedUrl) {
        const isValid = await isUrlReachable(resolvedUrl, resolvedKey);
        if (!isValid) {
          return HttpResponse.badRequest('Store URL ou clé API invalide').send(
            res
          );
        }
      }
    }

    const settings = await this.settingsService.updateSettings(result.data!);
    HttpResponse.success(
      settings,
      'Paramètres du store mis à jour avec succès'
    ).send(res);
  });

  /**
   * Updates the organisation settings (orgCode).
   * The orgCode is used as the registration code for new supervisor accounts.
   *
   * @route  PATCH /settings/org
   * @access ADMIN only
   *
   * @body   { orgCode: string }
   *
   * @returns
   *   - 200 { data: Setting & { integrations: Integration[] } }
   *   - 400 validation errors
   *   - 403 requester is not ADMIN
   */
  updateOrgSettings = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== Role.ADMIN) {
      return HttpResponse.forbidden(
        'Seul un administrateur peut modifier le code organisation.'
      ).send(res);
    }

    const result = await updateOrgSettingsSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const settings = await this.settingsService.updateSettings(result.data!);
    HttpResponse.success(
      settings,
      'Code organisation mis à jour avec succès'
    ).send(res);
  });

  // Integrations

  /**
   * Retrieves all integrations linked to the singleton settings row.
   *
   * @route  GET /settings/integrations
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: Integration[] }
   */
  getIntegrations = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type ? String(req.query.type) : undefined;
    const integrations = await this.settingsService.getIntegrations(type);
    HttpResponse.success(
      integrations,
      'Intégrations récupérées avec succès'
    ).send(res);
  });

  /**
   * Retrieves a single integration by ID.
   *
   * @route  GET /settings/integrations/:integrationId
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: Integration }
   *   - 404 integration not found
   */
  getIntegrationById = asyncHandler(async (req: Request, res: Response) => {
    const integrationId = String(req.params.integrationId);
    const integration =
      await this.settingsService.getIntegrationById(integrationId);

    if (!integration) {
      return HttpResponse.notFound('Intégration introuvable').send(res);
    }

    HttpResponse.success(integration, 'Intégration récupérée avec succès').send(
      res
    );
  });

  /**
   * Creates a new integration linked to the singleton settings row.
   * The URL is validated for reachability and the key is checked against
   * the provided endpoint before saving.
   *
   * @route  POST /settings/integrations
   * @access ADMIN
   *
   * @body   {
   *   id: string,
   *   name: string,
   *   url: string,
   *   type: 'ASSET' | 'MUSIC' | 'OTHER',
   *   key?: string,
   *   isActive?: boolean,
   *   fieldMapping?: { id: string, name: string, category?: string, file: string, thumbnail?: string }
   * }
   *
   * @returns
   *   - 201 { data: Integration }
   *   - 400 validation errors | unreachable URL or invalid key
   */
  createIntegration = asyncHandler(async (req: Request, res: Response) => {
    const result = await createIntegrationSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { url, key } = result.data!;
    const isValid = await isUrlReachable(url, key);
    if (!isValid) {
      return HttpResponse.badRequest('URL ou clé API invalide').send(res);
    }

    const integration = await this.settingsService.createIntegration(
      result.data!
    );
    HttpResponse.created(integration, 'Intégration créée avec succès').send(
      res
    );
  });

  /**
   * Partially updates an existing integration.
   * If url or key are provided, a live reachability check is performed
   * against the resolved URL and key before saving.
   *
   * @route  PATCH /settings/integrations/:integrationId
   * @access ADMIN
   *
   * @body   {
   *   name?: string,
   *   url?: string,
   *   type?: 'ASSET' | 'MUSIC' | 'OTHER',
   *   key?: string,
   *   isActive?: boolean,
   *   fieldMapping?: { id: string, name: string, category?: string, file: string, thumbnail?: string }
   * }
   *
   * @returns
   *   - 200 { data: Integration }
   *   - 400 validation errors | unreachable URL or invalid key
   */
  updateIntegration = asyncHandler(async (req: Request, res: Response) => {
    const integrationId = String(req.params.integrationId);

    const result = await updateIntegrationSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const { url, key } = result.data!;
    if (url || key) {
      const existing =
        await this.settingsService.getIntegrationById(integrationId);
      const resolvedUrl = url ?? existing?.url;
      const resolvedKey = key ?? (existing?.key as string);

      const isValid = await isUrlReachable(resolvedUrl, resolvedKey);
      if (!isValid) {
        return HttpResponse.badRequest('URL ou clé API invalide').send(res);
      }
    }

    const integration = await this.settingsService.updateIntegration(
      integrationId,
      result.data!
    );
    HttpResponse.success(
      integration,
      'Intégration mise à jour avec succès'
    ).send(res);
  });

  /**
   * Toggles the isActive flag of an integration.
   * The current value is read from the database and inverted — no body required.
   *
   * @route  PATCH /settings/integrations/:integrationId/toggle
   * @access ADMIN
   *
   * @returns
   *   - 200 { data: Integration }
   *   - 404 integration not found
   */
  toggleIntegration = asyncHandler(async (req: Request, res: Response) => {
    const integrationId = String(req.params.integrationId);
    const integration =
      await this.settingsService.toggleIntegration(integrationId);
    HttpResponse.success(
      integration,
      "Statut de l'intégration mis à jour"
    ).send(res);
  });

  /**
   * Permanently deletes an integration.
   * This action is irreversible — the fieldMapping data is also removed.
   *
   * @route  DELETE /settings/integrations/:integrationId
   * @access ADMIN
   *
   * @returns
   *   - 204
   */
  deleteIntegration = asyncHandler(async (req: Request, res: Response) => {
    const integrationId = String(req.params.integrationId);
    await this.settingsService.deleteIntegration(integrationId);
    HttpResponse.deleted('Intégration supprimée avec succès').send(res);
  });
}
