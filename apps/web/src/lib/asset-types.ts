/**
 * @file asset-types.ts
 * Single source of truth for the AssetType enum used across the app.
 *
 * Values match the Prisma AssetType enum exactly.
 * Labels are provided in both English (used by external APIs like Poly Pizza)
 * and French (displayed in the UI).
 */

export interface AssetTypeEntry {
  value: AssetType;
  en: string;
  fr: string;
}

export const ASSET_TYPES: AssetTypeEntry[] = [
  { value: 'FOOD_AND_DRINK', en: 'Food & Drink', fr: 'Nourriture & Boissons' },
  { value: 'CLUTTER', en: 'Clutter', fr: 'Divers' },
  { value: 'WEAPONS', en: 'Weapons', fr: 'Armes' },
  { value: 'TRANSPORT', en: 'Transport', fr: 'Transport' },
  {
    value: 'FURNITURE_AND_DECOR',
    en: 'Furniture & Decor',
    fr: 'Meubles & Décoration',
  },
  { value: 'OBJECTS', en: 'Objects', fr: 'Objets' },
  { value: 'NATURE', en: 'Nature', fr: 'Nature' },
  { value: 'ANIMALS', en: 'Animals', fr: 'Animaux' },
  { value: 'BUILDINGS', en: 'Buildings', fr: 'Architecture' },
  {
    value: 'PEOPLE_AND_CHARACTERS',
    en: 'People & Characters',
    fr: 'Personnages',
  },
  { value: 'SCENES_AND_LEVELS', en: 'Scenes & Levels', fr: 'Scènes & Niveaux' },
  { value: 'OTHER', en: 'Other', fr: 'Autre' },
] as const;

export const ASSET_TYPE_FR: Record<AssetType, string> = Object.fromEntries(
  ASSET_TYPES.map(t => [t.value, t.fr])
) as Record<AssetType, string>;

export const ASSET_TYPE_EN: Record<AssetType, string> = Object.fromEntries(
  ASSET_TYPES.map(t => [t.value, t.en])
) as Record<AssetType, string>;

/**
 * Map an arbitrary string (e.g. from an external API like Poly Pizza)
 * to the closest AssetType enum value.
 * Falls back to 'OTHER' when no match is found.
 */
export function matchAssetType(raw: string): AssetType {
  const normalised = raw.trim().toLowerCase();
  const match = ASSET_TYPES.find(
    t =>
      t.en.toLowerCase() === normalised ||
      t.fr.toLowerCase() === normalised ||
      t.value.toLowerCase() === normalised
  );
  return match?.value ?? 'OTHER';
}
