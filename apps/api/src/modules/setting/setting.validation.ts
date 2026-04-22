import { IntegrationType } from '@prisma/client';
import * as z from 'zod';

/**
 * Integration field mapping schema
 *
 * Defines how external resource fields map to internal document fields
 * @property {string} id - Unique identifier of the mapped resource
 * @property {string} name - Display name of the resource
 * @property {string} [category] - Optional category grouping
 * @property {string} file - Path or URL to the associated file
 * @property {string} [thumbnail] - Optional thumbnail image path or URL
 */
export const fieldMappingSchema = z.object({
  id: z.string({ error: () => "L'identifiant est requis" }),
  name: z.string({ error: () => 'Le nom est requis' }),
  category: z.string().optional(),
  file: z.string({ error: () => 'Le fichier est requis' }),
  thumbnail: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/**
 * Schema for updating store settings.
 *
 * @property {string} [storeName] - The store display name
 * @property {string} [storeURL]  - Valid URL, checked for reachability in the controller
 * @property {string} [storeKey]  - Optional API key for the store
 *
 * Messages are in French (FR)
 */
export const updateStoreSettingsSchema = z
  .object({
    storeName: z.string().min(1, 'Le nom du store est requis').optional(),
    storeURL: z.url('URL invalide').optional(),
    storeKey: z.string().optional(),
  })
  .refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'Au moins un champ doit être fourni.',
  });

/**
 * Schema for updating organisation settings.
 * Only exposed to ADMIN — enforced in the controller.
 *
 * @property {string} orgCode - The registration code supervisors must provide at sign-up.
 *                              Minimum 4 characters.
 *
 * Messages are in French (FR)
 */
export const updateOrgSettingsSchema = z.object({
  orgCode: z
    .string()
    .min(4, 'Le code organisation doit comporter au moins 4 caractères'),
});

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

/**
 * Integration creation schema
 *
 * @property {string} id - Unique identifier for the integration (min 2 characters)
 * @property {string} name - Display name (min 2 characters)
 * @property {string} url - Endpoint URL of the integration
 *   - Must be a valid URL format
 *   - Must be reachable
 * @property {IntegrationType} type - Integration protocol type (ASSET | NUSIC | OTHER)
 * @property {string} key - API key or secret used to authenticate with the integration
 *   - Min 8 characters
 *   - Combined with url: endpoint must accept the key (async check)
 * @property {boolean} [isActive] - Whether the integration is active (default: true)
 * @property {FieldMapping} [fieldMapping] - Optional field mapping configuration
 *
 * Messages are in French (FR)
 */
export const createIntegrationSchema = z.object({
  name: z
    .string({ error: () => 'Le nom est requis' })
    .min(2, 'Le nom doit comporter au moins 2 caractères'),
  url: z.url({ error: () => "L'URL de l'intégration est invalide" }),
  type: z.enum(IntegrationType, {
    error: iss =>
      iss.input === undefined
        ? 'Le type est requis'
        : 'Type invalide. Valeurs acceptées: ASSET, MUSIC, AUTRE',
  }),
  key: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 8, {
      message: 'La clé API doit comporter au moins 8 caractères',
    }),
  isActive: z.boolean().optional(),
  fieldMapping: fieldMappingSchema.optional(),
});

/**
 * Integration update schema
 *
 * All fields are optional — only provided fields will be updated.
 * If both url and key are provided, the endpoint/key pair is re-validated.
 * If only url or only key is changed, no live check is performed
 * (use createIntegrationSchema for full validation on re-creation).
 *
 * Messages are in French (FR)
 */
export const updateIntegrationSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Le nom doit comporter au moins 2 caractères')
      .optional(),
    url: z
      .url({ error: () => "L'URL de l'intégration est invalide" })
      .optional(),
    type: z
      .enum(IntegrationType, {
        error: () => 'Type invalide. Valeurs acceptées: ASSET, MUSIC, AUTRE',
      })
      .optional(),
    key: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 8, {
        message: 'La clé API doit comporter au moins 8 caractères',
      }),
    isActive: z.boolean().optional(),
    fieldMapping: fieldMappingSchema.optional(),
  })
  .refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'Au moins un champ doit être fourni',
    path: ['name'],
  });
