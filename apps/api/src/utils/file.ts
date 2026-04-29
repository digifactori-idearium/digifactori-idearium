import { type Request } from 'express';

/**
 * Cast req.files to the multer fields map shape.
 * Returns {} when multer hasn't run (pure JSON requests).
 */
export function getFieldsMap(
  req: Request
): Record<string, Express.Multer.File[]> {
  return (req.files as Record<string, Express.Multer.File[]>) ?? {};
}

/** Pull a single multer file from the fields map and normalise to UploadedFile. */
export function extractFile(
  map: Record<string, Express.Multer.File[]>,
  field: string
): UploadedFile | undefined {
  const f = map[field]?.[0];
  if (!f) return undefined;
  return {
    originalname: f.originalname,
    mimetype: f.mimetype,
    buffer: Buffer.from(f.buffer),
  };
}

/** Pull every multer file uploaded under a given field name. */
export function extractFiles(
  map: Record<string, Express.Multer.File[]>,
  field: string
): UploadedFile[] {
  return (map[field] ?? []).map(f => ({
    originalname: f.originalname,
    mimetype: f.mimetype,
    buffer: Buffer.from(f.buffer),
  }));
}
