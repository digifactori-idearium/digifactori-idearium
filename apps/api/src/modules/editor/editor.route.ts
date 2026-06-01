import { Router, type Router as ExpressRouter } from 'express';

import EditorController from './editor.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { checkDocumentExistence } from '@/middlewares/checkExistence';
import { IEditorService } from '@/types';

export default function createEditorRoutes(voxelService: IEditorService) {
  const voxelController = new EditorController(voxelService);
  const editorRoutes: ExpressRouter = Router();

  editorRoutes.use(authenticate, requireAuth);

  editorRoutes.get('/', voxelController.getUserDocuments);
  editorRoutes.get('/:documentId', voxelController.getDocumentById);
  editorRoutes.post('/', voxelController.createDocument);
  editorRoutes.post<{ documentId: string }>(
    '/:documentId/save',
    (req, res, next) =>
      checkDocumentExistence(
        req.params.documentId,
        res,
        next,
        voxelService.getDocumentById
      ),
    voxelController.saveDocument
  );
  editorRoutes.patch<{ documentId: string }>(
    '/:documentId',
    (req, res, next) =>
      checkDocumentExistence(
        req.params.documentId,
        res,
        next,
        voxelService.getDocumentById
      ),
    voxelController.updateDocument
  );
  editorRoutes.delete<{ documentId: string }>(
    '/:documentId',
    (req, res, next) =>
      checkDocumentExistence(
        req.params.documentId,
        res,
        next,
        voxelService.getDocumentById
      ),
    voxelController.deleteDocument
  );

  return editorRoutes;
}
