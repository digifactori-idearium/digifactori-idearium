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
 *   category    — "ASSET" | "MUSIC" | "OTHER"
 *   tags        — JSON-encoded string array, e.g. '["tag1","tag2"]'
 */
export function buildSingleFormData(
  input: CreateAssetInput | UpdateAssetInput
): FormData {
  const form = new FormData();

  if (input.name !== undefined) form.append('name', input.name);
  if (input.category !== undefined) form.append('category', input.category);
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

/**
 * Infer a default asset category from a browser File object.
 * Used when the user hasn't explicitly chosen a category.
 *
 * - audio/* → MUSIC
 * - image/* → OTHER
 * - everything else (3D models, etc.) → ASSET
 */
export function inferCategory(file: File): AssetCategory {
  if (file.type.startsWith('audio/')) return 'MUSIC';
  if (file.type.startsWith('image/')) return 'OTHER';
  return 'ASSET';
}
