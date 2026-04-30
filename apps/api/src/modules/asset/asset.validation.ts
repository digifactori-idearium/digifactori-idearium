import { IntegrationType } from '@prisma/client';
import * as z from 'zod';

const nameField = z
  .string({ error: () => 'Le nom est requis' })
  .min(2, 'Le nom doit comporter au moins 2 caractères')
  .max(255, 'Le nom ne peut pas dépasser 255 caractères');

const categoryField = z.enum(IntegrationType, {
  error: iss =>
    iss.input === undefined
      ? 'La catégorie est requise'
      : 'Catégorie invalide. Valeurs acceptées: MODEL_3D, SOUND, IMAGE, OTHER',
});

const tagsField = z
  .union([
    z.string().transform((val, ctx) => {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Les tags doivent être un tableau de chaînes',
          });
          return z.NEVER;
        }
        return parsed as string[];
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Les tags doivent être un tableau JSON valide',
        });
        return z.NEVER;
      }
    }),
    z.array(z.string()).default([]),
  ])
  .optional()
  .default([]);

/**
 * Schema for creating a single asset.
 *
 * File fields (`file`, `thumbnail`) are validated separately via multer.
 * This schema validates the text fields from req.body.
 *
 * @property {string} name - Display name (min 2 chars)
 * @property {IntegrationType} category - MODEL_3D | SOUND | IMAGE | OTHER
 * @property {string[]} [tags] - Optional array of tags (JSON string in multipart)
 *
 * Messages are in French (FR)
 */
export const createAssetSchema = z.object({
  name: nameField,
  category: categoryField,
  tags: tagsField,
});

/**
 * Single item descriptor inside a bulk creation request.
 * Sent as a JSON-encoded `data` field alongside the `files[]` form data.
 */
export const bulkAssetItemSchema = z.object({
  name: nameField,
  category: categoryField,
  tags: z
    .array(z.string(), {
      error: () => 'Les tags doivent être un tableau de chaînes',
    })
    .optional()
    .default([]),
  fileIndex: z
    .number({ error: () => 'fileIndex doit être un nombre' })
    .int()
    .min(0),

  thumbnailIndex: z.number().int().min(0).optional(),
});

/**
 * Schema for bulk asset creation.
 * The client sends a `data` field that is a JSON-encoded array of
 * {@link bulkAssetItemSchema} objects.
 *
 * @property {string} data - JSON-encoded array of asset descriptors
 */
export const createBulkAssetsSchema = z.object({
  data: z
    .string({ error: () => 'Le champ data est requis' })
    .transform((val, ctx): z.infer<typeof bulkAssetItemSchema>[] => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(val);
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ data doit être un tableau JSON valide',
        });
        return z.NEVER;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ data doit être un tableau non vide',
        });
        return z.NEVER;
      }

      const results = parsed.map((item, i) => {
        const result = bulkAssetItemSchema.safeParse(item);
        if (!result.success) {
          result.error.issues.forEach(issue => {
            ctx.addIssue({
              ...issue,
              path: [`[${i}]`, ...(issue.path ?? [])],
            });
          });
          return z.NEVER as any;
        }
        return result.data;
      });

      return results;
    }),
});

/**
 * Schema for updating an existing asset.
 * At least one field must be provided.
 * File replacement is handled separately (re-upload via the create flow).
 *
 * @property {string} [name] - New display name
 * @property {IntegrationType} [category] - New category
 * @property {string[]} [tags] - Replace the full tag list
 *
 * Messages are in French (FR)
 */
export const updateAssetSchema = z
  .object({
    name: nameField.optional(),
    category: categoryField.optional(),
    tags: tagsField,
  })
  .refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'Au moins un champ doit être fourni.',
  });

/**
 * Schema for GET /assets query parameters.
 *
 * @property {IntegrationType} [category] - Filter by category
 * @property {string} [search] - Partial name search (case-insensitive)
 * @property {string} [tags] - Comma-separated list of tags to filter by (AND)
 * @property {number} [page] - Page number (default 1)
 * @property {number} [limit] - Items per page (default 20, max 100)
 */
export const listAssetsQuerySchema = z.object({
  category: categoryField.optional(),
  search: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(t => t.trim()) : undefined)),
  page: z
    .string()
    .optional()
    .transform(val => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val =>
      val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20
    ),
});

/**
 * Schema for bulk deletion.
 *
 * @property {string[]} ids - Non-empty array of asset IDs to delete
 */
export const bulkDeleteAssetsSchema = z.object({
  ids: z
    .array(
      z.string({ error: () => 'Chaque identifiant doit être une chaîne' }),
      {
        error: () => 'Le champ ids est requis',
      }
    )
    .min(1, 'Au moins un identifiant est requis'),
});
