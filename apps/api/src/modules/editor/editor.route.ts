import { Router, type Router as ExpressRouter } from 'express';

import EditorController from './editor.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { IEditorService } from '@/types';

export default function createEditorRoutes(voxelService: IEditorService) {
  const voxelController = new EditorController(voxelService);
  const editorRoutes: ExpressRouter = Router();

  editorRoutes.use(authenticate, requireAuth);

  editorRoutes.post('/', voxelController.createDocument);
  editorRoutes.get('/', voxelController.getUserDocuments);
  editorRoutes.get('/:documentId', voxelController.getDocumentById);
  editorRoutes.patch('/:documentId', voxelController.updateDocument);
  editorRoutes.delete('/:documentId', voxelController.deleteDocument);
  editorRoutes.post('/:documentId/save', voxelController.saveDocument);

  return editorRoutes;
}
