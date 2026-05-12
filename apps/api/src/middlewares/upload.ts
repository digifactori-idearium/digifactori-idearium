import { type Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/mp4',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  // 3D models
  'model/gltf-binary', // .glb
  'model/gltf+json', // .gltf
  'application/octet-stream', // .glb fallback
  // Ideorama Scene configuration
  'application/json', // .json
  'text/plain', // .json fallback
  // Documents / archives
  'application/pdf',
  'application/zip',
]);

/**
 * File extensions that are whitelisted when the browser sends a generic
 * `application/octet-stream` or `text/plain` MIME type.
 */
const ALLOWED_EXTENSIONS = new Set(['.glb', '.gltf', '.json']);

const MAX_FILE_SIZE_MB = 200;
const MAX_FILES_BULK = 50;

// Filter
function fileFilter(
  _req: Request,
  file: multer.File,
  cb: FileFilterCallback
): void {
  const ext = file.originalname
    .slice(file.originalname.lastIndexOf('.'))
    .toLowerCase();

  if (ALLOWED_MIME_TYPES.has(file.mimetype) || ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Type de fichier non supporté: ${file.mimetype} (${ext}). ` +
          `Types acceptés: images, audio, vidéo, modèles 3D (.glb, .gltf), JSON, PDF, ZIP.`
      )
    );
  }
}

// Multer instances (memory storage; bytes forwarded to storage service)
const baseOptions: multer.Options = {
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
};

/**
 * Multer middleware for a single asset upload.
 */
export const uploadSingle = multer(baseOptions).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

/**
 * Multer middleware for bulk asset uploads.
 */
export const uploadBulk = multer(baseOptions).fields([
  { name: 'files', maxCount: MAX_FILES_BULK },
  { name: 'thumbnails', maxCount: MAX_FILES_BULK },
]);

export const uploadGlb = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname
      .slice(file.originalname.lastIndexOf('.'))
      .toLowerCase();
    const allowed =
      file.mimetype === 'model/gltf-binary' ||
      file.mimetype === 'application/octet-stream' ||
      ext === '.glb';
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error(`Only GLB files are allowed (got ${file.mimetype})`));
    }
  },
}).single('file');

export const uploadScene = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname
      .slice(file.originalname.lastIndexOf('.'))
      .toLowerCase();
    const allowed =
      file.mimetype === 'application/json' ||
      file.mimetype === 'text/plain' ||
      ext === '.json';
    if (allowed) cb(null, true);
    else cb(new Error(`Only JSON files are allowed (got ${file.mimetype})`));
  },
}).single('file');
