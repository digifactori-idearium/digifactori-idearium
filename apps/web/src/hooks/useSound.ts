import { useMediaLibrary } from './useMediaLibrary';

export const useSound = (searchTerm?: string) => {
  const { items, ...rest } = useMediaLibrary('SOUND', searchTerm ?? '');

  const sounds: MusicItem[] = items.map(item => ({
    id: item.id,
    name: item.name,
    frName: item.name,
    category: item.category,
    file: item.file,
  }));

  return { sounds, ...rest };
};
