import { type Request, type Response } from 'express';

import { resolveStorageAdapter } from './storage.factory';
import StorageService from './storage.service';
import { updateStorageSchema, testStorageSchema } from './storage.validation';
import { validateStorageCredentials } from './storage.validator';

import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';
import { failOnValidation } from '@/utils/validation-errors';

const SIGNED_URL_TTL = 3600;
const SAFE_KEY_RE = new RegExp('^[a-zA-Z0-9_./-]+$');

function isSafeKey(key: string): boolean {
  return SAFE_KEY_RE.test(key) && !key.includes('..');
}

function normalizeKey(raw: string | string[]): string {
  if (Array.isArray(raw)) return raw.join('/');
  if (raw.includes(',')) return raw.replace(/,/g, '/');
  return raw;
}

export default class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Returns a short-lived signed URL so the frontend can fetch the asset
   * directly from the storage provider without backend proxying.
   *
   * @route  GET /storage/signed-url
   * @access Authenticated
   * @query  key {string} — storage key, e.g. "assets/models/abc123.glb"
   *
   * @returns 200 { data: { url: string; expiresAt: string } }
   *          400 if key is missing
   */
  getSignedUrl = asyncHandler(async (req: Request, res: Response) => {
    const key = req.query.key as string | undefined;
    if (!key?.trim()) {
      return HttpResponse.badRequest('Paramètre "key" manquant').send(res);
    }

    const adapter = await resolveStorageAdapter();

    let url: string;
    const expiresAt = new Date(
      Date.now() + SIGNED_URL_TTL * 1000
    ).toISOString();

    if (adapter.getSignedUrl) {
      // Remote provider — return a presigned URL the browser hits directly.
      url = await adapter.getSignedUrl(key, SIGNED_URL_TTL);
    } else {
      // LOCAL — route through the proxy endpoint (dev only).
      url = `/api/storage/file/${key}`;
    }

    return HttpResponse.success({ url, expiresAt }, 'URL signée générée').send(
      res
    );
  });

  /**
   * Streams an asset file from the storage provider (R2 / S3 / Azure)
   * through the backend to avoid CORS issues on the frontend.
   *
   * @route  GET /assets/file/:key
   * @access Authenticated
   *
   * @param  key {string} required — storage key (e.g. "assets/abc123.glb")
   *
   * @returns
   *   200 {file stream}
   *   400 {message: "Clé de fichier manquante"}
   *   404 {message: "Fichier introuvable"}
   */
  getStorageFile = asyncHandler(async (req: Request, res: Response) => {
    const key = normalizeKey(req.params.splat);

    if (!key)
      return HttpResponse.badRequest('Clé de fichier manquante').send(res);
    if (!isSafeKey(key))
      return HttpResponse.badRequest('Clé de fichier invalide').send(res);

    const storage = await this.storageService.getStorage();

    let allowedOrigin: string;
    try {
      allowedOrigin = new URL(storage.publicUrl ? storage.publicUrl : '')
        .origin;
    } catch {
      throw new Error(`STORAGE publicUrl is invalid: "${storage.publicUrl}"`);
    }

    const adapter = await resolveStorageAdapter();
    const fileUrl = adapter.getPublicUrl(key);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(fileUrl);
    } catch {
      return HttpResponse.serverError('URL de fichier invalide').send(res);
    }

    if (parsedUrl.origin !== allowedOrigin) {
      return HttpResponse.badRequest('URL de fichier non autorisée').send(res);
    }

    return res.redirect(302, parsedUrl.toString());
  });

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
