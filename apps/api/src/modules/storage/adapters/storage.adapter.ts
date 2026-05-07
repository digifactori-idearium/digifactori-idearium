export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

/**
 * @description Main adapter interface for storage providers.
 *
 * Key design decisions:
 *   - `getPublicUrl`   → permanent CDN/bucket URL (no auth). Use for public assets.
 *   - `getSignedUrl`   → short-lived signed URL with auth. Use for private assets.
 *                        Falls back to `getPublicUrl` on adapters that don't need signing
 *                        (LOCAL, or public buckets).
 */
export interface StorageAdapter {
  /**
   * Upload a file and return its storage key.
   * The DB saves the key only — not the URL.
   *
   * @param file      - The file to upload.
   * @param uploadDir - Optional subdirectory / prefix, e.g. "assets/models".
   * @param fileId    - Optional ID to use as the filename stem.
   * @returns The storage key, e.g. "assets/models/abc123.glb"
   */
  upload(
    file: UploadedFile,
    uploadDir?: string | null,
    fileId?: string | number | null
  ): Promise<string>;

  /**
   * Delete a file by its storage key.
   * Errors are ignored — a missing file should never block a DB deletion.
   */
  delete(key: string): Promise<void>;

  /**
   * Resolve a storage key to its permanent public-facing URL.
   * No auth embedded — only works for public buckets / CDN origins.
   *
   * @param key - e.g. "assets/models/abc123.glb"
   * @returns   - e.g. "https://assets.yourapp.com/assets/models/abc123.glb"
   */
  getPublicUrl(key: string): string;

  /**
   * Resolve a storage key to a short-lived signed URL.
   *
   * Defaults to `getPublicUrl` for adapters that don't require signing
   * (LOCAL, publicly-accessible buckets).
   *
   * @param key       - Storage key.
   * @param expiresIn - TTL in seconds (default: 3600).
   * @returns         - A URL the browser can fetch directly without extra headers.
   */
  getSignedUrl?(key: string, expiresIn?: number): Promise<string>;
}
