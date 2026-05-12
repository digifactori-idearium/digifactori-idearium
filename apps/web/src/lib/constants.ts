export {
  ASSET_TYPES,
  ASSET_TYPE_FR,
  ASSET_TYPE_EN,
  matchAssetType,
} from './asset-types';

/**
 * @deprecated Use ASSET_TYPES from asset-types.ts instead.
 * Kept for backward compatibility with any code that still references CATEGORIES.
 */
export const CATEGORIES = [
  { id: 0, fr: 'Nourriture', en: 'Food & Drink' },
  { id: 1, fr: 'Divers', en: 'Clutter' },
  { id: 2, fr: 'Armes', en: 'Weapons' },
  { id: 3, fr: 'Transport', en: 'Transport' },
  { id: 4, fr: 'Meubles', en: 'Furniture & Decor' },
  { id: 5, fr: 'Objets', en: 'Objects' },
  { id: 6, fr: 'Nature', en: 'Nature' },
  { id: 7, fr: 'Animaux', en: 'Animals' },
  { id: 8, fr: 'Architecture', en: 'Buildings' },
  { id: 9, fr: 'Personnages', en: 'People & Characters' },
  { id: 10, fr: 'Scenes', en: 'Scenes & Levels' },
  { id: 11, fr: 'Autre', en: 'Other' },
] as const;

// My Space Constants

export const DARK_THEME: ThemePalette = {
  backgrounds: [
    {
      label: 'Cosmos',
      thumb: 'radial-gradient(#2a0550,#060010)',
      value:
        'radial-gradient(ellipse at 50% 38%, #1e0440 0%, #0d0122 55%, #060010 100%)',
    },
    {
      label: 'Océan nuit',
      thumb: 'radial-gradient(#001840,#000a18)',
      value:
        'radial-gradient(ellipse at 50% 38%, #001840 0%, #000d22 55%, #000a18 100%)',
    },
    {
      label: 'Forêt nuit',
      thumb: 'radial-gradient(#091a00,#010800)',
      value:
        'radial-gradient(ellipse at 50% 38%, #091a00 0%, #041000 55%, #010800 100%)',
    },
    {
      label: 'Crépuscule',
      thumb: 'radial-gradient(#2e0018,#0d0006)',
      value:
        'radial-gradient(ellipse at 50% 38%, #2e0018 0%, #180010 55%, #0d0006 100%)',
    },
    {
      label: 'Minuit',
      thumb: 'radial-gradient(#0d0d22,#04040e)',
      value:
        'radial-gradient(ellipse at 50% 38%, #0d0d22 0%, #080818 55%, #04040e 100%)',
    },
  ],
  defaultBg:
    'radial-gradient(ellipse at 50% 38%, #1e0440 0%, #0d0122 55%, #060010 100%)',
  orbitRingColor: 'rgba(255,255,255,0.07)',
  pulseRingColor: 'rgba(168,85,247,0.28)',
  greetingText: '#d8b4fe',
  greetingBg: 'rgba(255,255,255,0.06)',
  greetingBorder: 'rgba(255,255,255,0.10)',
  statText: '#c4b5fd',
  statBg: 'rgba(255,255,255,0.07)',
  statBorder: 'rgba(255,255,255,0.10)',
  loadingBg: '#0d0122',
  loadingText: '#a78bfa',
  loadingSpinner: 'text-purple-400',
};

export const LIGHT_THEME: ThemePalette = {
  backgrounds: [
    {
      label: 'Ciel bleu',
      thumb: 'linear-gradient(180deg,#a8d8f0,#e8f5ff)',
      value: 'linear-gradient(180deg, #87ceeb 0%, #b8e4f9 40%, #e8f5ff 100%)',
    },
    {
      label: 'Aube',
      thumb: 'linear-gradient(180deg,#ffcba4,#fff5e0)',
      value: 'linear-gradient(180deg, #ffd6a5 0%, #ffe8cc 50%, #fff8f0 100%)',
    },
    {
      label: 'Prairie',
      thumb: 'linear-gradient(180deg,#b5e48c,#f0ffe0)',
      value: 'linear-gradient(180deg, #90e86f 0%, #c5f0a0 45%, #f0ffe0 100%)',
    },
    {
      label: 'Rose pâle',
      thumb: 'linear-gradient(180deg,#ffb3c6,#fff0f5)',
      value: 'linear-gradient(180deg, #ffb3c6 0%, #ffd6e0 45%, #fff0f5 100%)',
    },
    {
      label: 'Lavande',
      thumb: 'linear-gradient(180deg,#c3b1e1,#f3f0ff)',
      value: 'linear-gradient(180deg, #c3b1e1 0%, #ddd5f5 45%, #f3f0ff 100%)',
    },
  ],
  defaultBg: 'linear-gradient(180deg, #87ceeb 0%, #b8e4f9 40%, #e8f5ff 100%)',
  orbitRingColor: 'rgba(0,100,200,0.12)',
  pulseRingColor: 'rgba(56,189,248,0.25)',
  greetingText: '#0c4a6e',
  greetingBg: 'rgba(255,255,255,0.55)',
  greetingBorder: 'rgba(100,180,255,0.30)',
  statText: '#075985',
  statBg: 'rgba(255,255,255,0.55)',
  statBorder: 'rgba(100,180,255,0.25)',
  loadingBg: '#e8f5ff',
  loadingText: '#0369a1',
  loadingSpinner: 'text-sky-500',
};

// Saving status
export const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: '',
  pending: 'Modifications en cours...',
  saving: 'Sauvegarde...',
  saved: '✓ Sauvegardé',
  error: '✗ Erreur de sauvegarde',
};

export const STATUS_COLOR: Record<SaveStatus, string> = {
  idle: '',
  pending: 'text-yellow-400/70',
  saving: 'text-blue-400/70',
  saved: 'text-green-400/70',
  error: 'text-red-400/70',
};
