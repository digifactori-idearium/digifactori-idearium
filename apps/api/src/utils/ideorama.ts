import path from 'node:path';

export const getUploadPath = (ideoramaId: string) => {
  const id = String(ideoramaId);
  // The id must be alphanumerical
  if (!/^[a-z0-9]+$/i.test(id)) {
    throw new Error('Invalid ideoramaId');
  }
  const fileName = `scene-${id}.json`;
  return path.join(process.cwd(), 'uploads/scenes', fileName);
};
