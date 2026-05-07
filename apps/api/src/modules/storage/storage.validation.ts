import { StorageProvider } from '@prisma/client';
import * as z from 'zod';

const providerField = z.enum(StorageProvider, {
  error: iss =>
    iss.input === undefined
      ? 'Le provider est requis'
      : 'Provider invalide. Valeurs acceptées: S3, R2, GCS, AZURE, MINIO, LOCAL',
});

/**
 * Schema for PATCH /storage
 *
 * All fields are optional — only provided fields are updated.
 * At least one field must be supplied.
 *
 * Credential requirements per provider (enforced in the controller after
 * schema validation, not here — keeps the schema generic):
 *
 *   S3    : accessKey, secretKey, bucket. region optional (default us-east-1).
 *   R2    : accessKey, secretKey, bucket, endpoint, publicUrl.
 *   GCS   : accessKey (HMAC), secretKey (HMAC), bucket, endpoint, publicUrl.
 *   MINIO : accessKey, secretKey, bucket, endpoint.
 *   AZURE : accessKey (account name), secretKey (account key), bucket (container).
 *   LOCAL : no credentials required — dev fallback only.
 *
 * Messages are in French (FR).
 */
export const updateStorageSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Le nom ne peut pas être vide')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      .optional(),

    provider: providerField.optional(),

    region: z.string().min(1, 'La région ne peut pas être vide').optional(),

    endpoint: z
      .url({ error: () => "L'endpoint doit être une URL valide" })
      .optional(),

    bucket: z
      .string()
      .min(1, 'Le nom du bucket ne peut pas être vide')
      .optional(),

    accessKey: z
      .string()
      .min(1, "L'accessKey ne peut pas être vide")
      .optional(),

    secretKey: z
      .string()
      .min(1, 'La secretKey ne peut pas être vide')
      .optional(),

    publicUrl: z.preprocess(
      v => (v === '' ? undefined : v),
      z.url({ error: () => 'publicUrl doit être une URL valide' }).optional()
    ),
  })
  .refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'Au moins un champ doit être fourni.',
  });

/**
 * Schema for POST /storage/test
 * Tests credentials without saving — full validation required.
 */
export const testStorageSchema = z
  .object({
    provider: providerField,
    region: z.string().optional(),
    endpoint: z
      .url({ error: () => "L'endpoint doit être une URL valide" })
      .optional(),
    bucket: z.string().min(1, 'Le bucket est requis').optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    publicUrl: z
      .url({ error: () => 'publicUrl doit être une URL valide' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'LOCAL') return;

    // All non-LOCAL providers need credentials.
    if (!data.accessKey) {
      ctx.addIssue({
        code: 'custom',
        path: ['accessKey'],
        message: `accessKey est requis pour le provider ${data.provider}`,
      });
    }
    if (!data.secretKey) {
      ctx.addIssue({
        code: 'custom',
        path: ['secretKey'],
        message: `secretKey est requis pour le provider ${data.provider}`,
      });
    }
    if (!data.bucket) {
      ctx.addIssue({
        code: 'custom',
        path: ['bucket'],
        message: `bucket est requis pour le provider ${data.provider}`,
      });
    }

    // Endpoint required for non-AWS providers.
    if (
      ['R2', 'GCS', 'MINIO', 'AZURE'].includes(data.provider) &&
      !data.endpoint
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['endpoint'],
        message: `endpoint est requis pour le provider ${data.provider}`,
      });
    }
  });
