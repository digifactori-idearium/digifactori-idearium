import { resolveStorageAdapter } from '@/modules/storage/storage.factory';

/**
 * Upload a file to the configured storage provider.
 *
 * @param file      - File buffer + metadata from multer.
 * @param uploadDir - Optional subdirectory, e.g. "assets/thumbnails".
 * @param fileId    - Optional ID used as the filename
 * @returns         - The storage key (persist this in the DB, not the URL).
 *
 * @example
 *   const key = await uploadFile(file, 'assets/models', asset.id);
 *   // key = "assets/models/blablabla.glb"
 */
export async function uploadFile(
  file: UploadedFile,
  uploadDir?: string | null,
  fileId?: string | number | null
): Promise<string> {
  const adapter = await resolveStorageAdapter();
  return adapter.upload(file, uploadDir, fileId);
}

/**
 * Delete a file by its storage key.
 *
 * @param key - The storage key returned by uploadFile, e.g. "assets/models/blablabla.glb"
 */
export async function deleteFile(key: string): Promise<void> {
  const adapter = await resolveStorageAdapter();
  await adapter.delete(key);
}

/**
 * Resolve a storage key to its full public URL.
 *
 * @param key - The storage key, e.g. "assets/models/blablabla.glb"
 * @returns   - e.g. "https://assets.yourapp.com/assets/models/blablabla.glb"
 */
export async function getPublicUrl(key: string): Promise<string> {
  const adapter = await resolveStorageAdapter();
  return adapter.getPublicUrl(key);
}

/**
 * Resolve multiple keys to public URLs in one adapter resolution.
 */
export async function getPublicUrls(
  keys: (string | null)[]
): Promise<(string | null)[]> {
  const adapter = await resolveStorageAdapter();
  return keys.map(key => (key ? adapter.getPublicUrl(key) : null));
}
