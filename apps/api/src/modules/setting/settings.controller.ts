import { type Request, type Response } from 'express';

import { ISettingsService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { isUrlReachable } from '@/utils/url-validation';
import { failOnValidation } from '@/utils/validation-errors';
import {
  updateSettingsSchema,
  createIntegrationSchema,
  updateIntegrationSchema,
} from '@/utils/validations';

export default class SettingsController {
  constructor(private readonly settingsService: ISettingsService) {}

  // ---------------------------------------------------------------------------
  // Settings (singleton)
  // ---------------------------------------------------------------------------

  /**
   * Retrieves the application settings
   *
   * @description Returns the singleton settings row, including all linked integrations.
   * If the row doesn't exist yet it is created automatically with empty defaults.
   *
   * @param {Request} req - Express request with authenticated user (req.user)
   * @param {Response} res - Express response object
   * @returns {Response} JSON response containing the settings and integrations
   */
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await this.settingsService.getSettings();
    HttpResponse.success(settings, 'Paramètres récupérés avec succès').send(
      res
    );
  });

  /**
   * Updates the application settings
   *
   * @description Partially updates the singleton settings row (storeName, storeURL).
   * storeURL is validated for format and reachability before saving.
   * At least one field must be provided.
   *
   * @param {Request} req - Express request with body: { storeName?: string, storeURL?: string }
   * @param {Response} res - Express response object
   * @returns {Response} JSON response containing the updated settings
   */
  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await updateSettingsSchema.safeParseAsync(req.body);
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
    HttpResponse.success(settings, 'Paramètres mis à jour avec succès').send(
      res
    );
  });

  // ---------------------------------------------------------------------------
  // Integrations
  // ---------------------------------------------------------------------------

  /**
   * Retrieves all integrations for the application
   *
   * @description Returns all integration records linked to the singleton settings row,
   * ordered by creation date descending.
   *
   * @param {Request} req - Express request with authenticated user (req.user)
   * @param {Response} res - Express response object
   * @returns {Response} JSON response containing the list of integrations
   */
  getIntegrations = asyncHandler(async (req: Request, res: Response) => {
    const integrations = await this.settingsService.getIntegrations();
    HttpResponse.success(
      integrations,
      'Intégrations récupérées avec succès'
    ).send(res);
  });

  /**
   * Retrieves a single integration by ID
   *
   * @description Fetches one integration record by its unique ID.
   * Returns 404 if the integration does not exist.
   *
   * @param {Request} req - Express request with integrationId in params
   * @param {Response} res - Express response object
   * @returns {Response} JSON response containing the integration, or 404
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
   * Creates a new integration
   *
   * @description Validates the request body against the integration schema, including:
   * - URL format and reachability (live HTTP check)
   * - API key length and validity against the provided endpoint (live auth check)
   * - Integration type must be one of: WEBHOOK, REST, GRAPHQL
   *
   * @param {Request} req - Express request with body:
   *   {
   *     id: string,
   *     name: string,
   *     url: string,
   *     type: 'ASSET' | 'MUSIC' | 'OTHER',
   *     key?: string,
   *     isActive?: boolean,
   *     fieldMapping?: { id: string, name: string, category?: string, file: string, thumbnail?: string }
   *   }
   * @param {Response} res - Express response object
   * @returns {Response} 201 JSON response containing the created integration, or 400 on validation failure
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
   * Updates an existing integration
   *
   * @description Partially updates an integration. All fields are optional.
   * If both url and key are provided together, a live endpoint/key check is performed.
   * At least one field must be present in the request body.
   *
   * @param {Request} req - Express request with integrationId in params and body:
   *   {
   *     name?: string,
   *     url?: string,
   *     type?: 'ASSET' | 'MUSIC' | 'OTHER',
   *     key?: string,
   *     isActive?: boolean,
   *     fieldMapping?: { id: string, name: string, category?: string, file: string, thumbnail?: string }
   *   }
   * @param {Response} res - Express response object
   * @returns {Response} JSON response containing the updated integration, or 400 on validation failure
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
   * Toggles the active state of an integration
   *
   * @description Flips the isActive boolean on the integration.
   * No request body required — the current value is read from the database and inverted.
   *
   * @param {Request} req - Express request with integrationId in params
   * @param {Response} res - Express response object
   * @returns {Response} JSON response containing the updated integration with new isActive value
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
   * Deletes an integration permanently
   *
   * @description Removes the integration record from the database.
   * This action is irreversible. The associated fieldMapping data is also removed.
   *
   * @param {Request} req - Express request with integrationId in params
   * @param {Response} res - Express response object
   * @returns {Response} 204 response on success
   */
  deleteIntegration = asyncHandler(async (req: Request, res: Response) => {
    const integrationId = String(req.params.integrationId);
    await this.settingsService.deleteIntegration(integrationId);
    HttpResponse.deleted('Intégration supprimée avec succès').send(res);
  });
}
