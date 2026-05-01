import path from 'node:path';

/**
 * Helper function to get the file path for an ideorama
 *
 * @description Generates and validates the upload path for an ideorama file.
 * Ensures the ID is alphanumeric to prevent path traversal attacks
 *
 * @param {string} ideoramaId - The unique identifier for the ideorama
 * @returns {string} The absolute file path for the ideorama JSON file
 * @throws {Error} If ideoramaId contains invalid characters
 */
export const getIdeoramaUploadPath = (ideoramaId: string) => {
  const id = String(ideoramaId);
  // The id must be alphanumerical
  if (!/^[a-z0-9]+$/i.test(id)) {
    throw new Error('Invalid ideoramaId');
  }
  const fileName = `scene-${id}.json`;
  return path.join(process.cwd(), 'uploads/scenes', fileName);
};

/**
 * Helper function to get the file path for a voxel model
 *
 * @description Generates and validates the upload path for a voxel model file.
 * Ensures the ID is alphanumeric to prevent path traversal attacks
 *
 * @param {string} voxelModelId - The unique identifier for the voxel model
 * @returns {string} The absolute file path for the voxel model JSON file
 * @throws {Error} If voxelModelId contains invalid characters
 */
export const getVoxelModelUploadPath = (voxelModelId: string): string => {
  const id = String(voxelModelId);

  if (!/^[a-z0-9]+$/i.test(id)) {
    throw new Error('Invalid voxelModelId');
  }

  const fileName = `model-${id}.json`;
  return path.join(process.cwd(), 'uploads/voxel-models', fileName);
};
