/**
 * @file lib/asset.ts
 * FormData builders for asset API calls.
 */

/**
 * Builds FormData for POST /assets or PATCH /assets/:id.
 *
 * API expects multipart/form-data:
 *   file        — required on create, optional on update (replaces existing)
 *   thumbnail   — optional
 *   name        — string
 *   category    — "MODEL_3D" | "SOUND" | "IMAGE" | "OTHER"
 *   tags        — JSON-encoded string array, e.g. '["tag1","tag2"]'
 */
export function buildSingleFormData(
  input: CreateAssetInput | UpdateAssetInput
): FormData {
  const form = new FormData();

  if (input.name !== undefined) form.append('name', input.name);
  if (input.category !== undefined) form.append('category', input.category);
  if (input.assetType !== undefined) form.append('assetType', input.assetType);
  if (input.tags !== undefined) form.append('tags', JSON.stringify(input.tags));
  if (input.file !== undefined) form.append('file', input.file);
  if (input.thumbnail !== undefined) form.append('thumbnail', input.thumbnail);

  return form;
}

/**
 * Builds FormData for POST /assets/bulk.
 *
 * API expects:
 *   files[]       — one File per asset, in order
 *   thumbnails[]  — one File per asset that has a thumbnail, in order
 *   data          — JSON string of BulkAssetDescriptor[]
 *
 * thumbnailIndex in each descriptor references the thumbnails[] sub-array
 * (not the full assets array).
 */
export function buildBulkFormData(input: BulkCreateAssetInput): FormData {
  const form = new FormData();
  const descriptors: BulkAssetDescriptor[] = [];
  let thumbCounter = 0;

  input.assets.forEach((asset, fileIndex) => {
    form.append('files', asset.file);

    const descriptor: BulkAssetDescriptor = {
      name: asset.name,
      category: asset.category,
      assetType: asset.assetType,
      tags: asset.tags,
      fileIndex,
    };

    if (asset.thumbnail) {
      form.append('thumbnails', asset.thumbnail);
      descriptor.thumbnailIndex = thumbCounter++;
    }

    descriptors.push(descriptor);
  });

  form.append('data', JSON.stringify(descriptors));
  return form;
}

const SOUND_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'ogg',
  'flac',
  'aac',
  'weba',
  'aiff',
  'aif',
  'm4a',
  'opus',
]);

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'avif',
  'bmp',
  'tiff',
  'tif',
]);

const MODEL_3D_EXTENSIONS = new Set(['glb', 'gltf', 'fbx', 'obj', 'usdz']);

/** Extract the lowercase extension from a filename */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Returns true when the file is an audio asset.
 */
export function isSound(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  return SOUND_EXTENSIONS.has(getExtension(file.name));
}

/**
 * Returns true when the file is an image asset.
 */
export function isImage(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.has(getExtension(file.name));
}

/**
 * Returns true when the file is a 3-D model asset.
 */
export function is3DModel(file: File): boolean {
  return MODEL_3D_EXTENSIONS.has(getExtension(file.name));
}

/**
 * Infer a default asset category from a browser File object.
 *
 * Priority: SOUND → IMAGE → MODEL_3D → OTHER
 * Both MIME type and file extension are checked so formats like .glb, .flac,
 * or .aiff (which browsers often report with an empty MIME type) are handled
 * correctly.
 */
export function inferCategory(file: File): AssetCategory {
  if (isSound(file)) return 'SOUND';
  if (isImage(file)) return 'IMAGE';
  if (is3DModel(file)) return 'MODEL_3D';
  return 'OTHER';
}
