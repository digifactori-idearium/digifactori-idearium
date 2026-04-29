import { type Request, type Response } from 'express';

import StorageService from './storage.service';
import { updateStorageSchema, testStorageSchema } from './storage.validation';
import { validateStorageCredentials } from './storage.validator';

import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

export default class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Returns the storage configuration (credentials are included — ADMIN only).
   *
   * @route  GET /storage
   * @access ADMIN
   *
   * @returns 200 { data: CloudStorage }
   */
  getStorage = asyncHandler(async (_req: Request, res: Response) => {
    const storage = await this.storageService.getStorage();
    HttpResponse.success(storage, 'Configuration storage récupérée').send(res);
  });

  /**
   * Tests storage credentials without saving anything.
   * Use this to verify config before committing it.
   *
   * @route  POST /storage/test
   * @access ADMIN
   *
   * @body   { provider, region?, endpoint?, bucket?, accessKey?, secretKey?, publicUrl? }
   *
   * @returns
   *   200 — credentials valid
   *   400 — validation error or invalid credentials
   */
  testStorage = asyncHandler(async (req: Request, res: Response) => {
    const result = await testStorageSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const validation = await validateStorageCredentials(result.data!);
    if (!validation.valid) {
      return HttpResponse.badRequest(validation.reason).send(res);
    }

    HttpResponse.success(null, 'Connexion au storage réussie').send(res);
  });

  /**
   * Updates the storage configuration.
   * Validates credentials before saving — prevents locking out with bad config.
   * Runs a credential test if any credential field (accessKey, secretKey,
   * bucket, endpoint) or the provider itself is being changed.
   *
   * @route  PATCH /storage
   * @access ADMIN
   *
   * @body   Partial<CloudStorage> — at least one field required
   *
   * @returns
   *   200 { data: CloudStorage }
   *   400 validation error | invalid credentials
   */
  updateStorage = asyncHandler(async (req: Request, res: Response) => {
    const result = await updateStorageSchema.safeParseAsync(req.body);
    if (failOnValidation(result, res)) return;

    const incoming = result.data!;
    const credentialChanged =
      incoming.provider !== undefined ||
      incoming.accessKey !== undefined ||
      incoming.secretKey !== undefined ||
      incoming.bucket !== undefined ||
      incoming.endpoint !== undefined;

    // Only run the live credential test when something credential-related changed.
    if (credentialChanged) {
      // Merge incoming with existing so the test always has a full picture.
      const existing = await this.storageService.getStorage();

      const merged = {
        provider: incoming.provider ?? existing.provider,
        region: incoming.region ?? existing.region ?? undefined,
        endpoint: incoming.endpoint ?? existing.endpoint ?? undefined,
        bucket: incoming.bucket ?? existing.bucket ?? undefined,
        accessKey: incoming.accessKey ?? existing.accessKey ?? undefined,
        secretKey: incoming.secretKey ?? existing.secretKey ?? undefined,
        publicUrl: incoming.publicUrl ?? existing.publicUrl ?? undefined,
      };

      const validation = await validateStorageCredentials(merged);
      if (!validation.valid) {
        return HttpResponse.badRequest(
          `Credentials invalides: ${validation.reason}`
        ).send(res);
      }
    }

    const storage = await this.storageService.updateStorage(incoming);
    HttpResponse.success(
      storage,
      'Configuration storage mise à jour avec succès'
    ).send(res);
  });

  /**
   * Resets storage back to LOCAL (removes all credentials).
   * Useful when migrating providers or disabling remote storage in dev.
   *
   * @route  DELETE /storage
   * @access ADMIN
   *
   * @returns 200 { data: CloudStorage }
   */
  resetStorage = asyncHandler(async (_req: Request, res: Response) => {
    const storage = await this.storageService.resetStorage();
    HttpResponse.success(storage, 'Storage réinitialisé en mode LOCAL').send(
      res
    );
  });
}
