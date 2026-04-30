import { useMediaLibrary } from './useMediaLibrary';

export const useAssets = (searchTerm?: string) =>
  useMediaLibrary('MODEL_3D', searchTerm ?? '');
