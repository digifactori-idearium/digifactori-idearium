export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

/**
 * @description main adapter interface for storage provider
 */
export interface StorageAdapter {
  /**
   * Upload a file and return its storage key.
   * The DB saves the key only not the URL.
   *
   * @param file      - The file to upload.
   * @param uploadDir - Optional subdirectory / prefix, e.g. "assets/models".
   * @param fileId    - Optional ID to use as the filename.
   * @returns The storage key, e.g. "assets/models/blablabla.glb"
   */
  upload(
    file: UploadedFile,
    uploadDir?: string | null,
    fileId?: string | number | null
  ): Promise<string>;

  /**
   * Delete a file by its storage key.
   * Errors are ingored, a missing file should block a DB deletion.
   */
  delete(key: string): Promise<void>;

  /**
   * Resolve a storage key to its public-facing URL.
   * @param key - e.g. "assets/models/blablabla.glb"
   * @returns   - e.g. "https://assets.yourapp.com/assets/models/abc123.glb"
   */
  getPublicUrl(key: string): string;
}
