import { IEditorService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

export default class EditorController {
  constructor(private readonly editorService: IEditorService) {}

  /**
   * Creates a new document for the authenticated user.
   *
   * @route  POST /editor
   * @access Authenticated
   *
   * @body   { title: string, content: string, json?: object, wordCount?: number, emoji?: string, color?: string }
   *
   * @returns
   *   - 201 { data: Document }
   *   - 400 validation error
   */
  createDocument = asyncHandler(async (req, res) => {
    const { title, content, json, wordCount, emoji, color } = req.body;
    const userId = req.user!.userId;

    const document = await this.editorService.createDocument({
      title,
      content,
      json,
      wordCount,
      emoji,
      color,
      userId,
    });

    HttpResponse.created(document, 'Document created successfully').send(res);
  });

  /**
   * Retrieves all documents belonging to the authenticated user.
   *
   * @route  GET /editor
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: Document[] }
   */
  getUserDocuments = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const documents = await this.editorService.getUserDocuments(userId);

    HttpResponse.success(documents, 'Documents retrieved successfully').send(
      res
    );
  });

  /**
   * Retrieves a single document by ID.
   *
   * @route  GET /editor/:documentId
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: Document }
   *   - 404 document not found
   */
  getDocumentById = asyncHandler(async (req, res) => {
    const document = await this.editorService.getDocumentById(
      req.params.documentId as string
    );
    if (!document) {
      return HttpResponse.notFound("Ce document n'existe pas").send(res);
    }
    HttpResponse.success(document, 'Document retrieved successfully').send(res);
  });

  /**
   * Updates an existing document with new data.
   *
   * @route  PATCH /editor/:documentId
   * @access Authenticated
   *
   * @body   { title?: string, content?: string, json?: object, wordCount?: number, emoji?: string, color?: string }
   *
   * @returns
   *   - 200 { data: Document }
   *   - 404 document not found
   */
  updateDocument = asyncHandler(async (req, res) => {
    const documentId = Array.isArray(req.params.documentId)
      ? req.params.documentId[0]
      : req.params.documentId;
    const { title, content, json, wordCount, emoji, color } = req.body;

    const document = await this.editorService.getDocumentById(documentId);

    if (!document) {
      return HttpResponse.notFound('Document introuvable').send(res);
    }

    const updatedDocument = await this.editorService.updateDocument(
      documentId,
      {
        title,
        content,
        json,
        wordCount,
        emoji,
        color,
      }
    );

    HttpResponse.success(
      updatedDocument,
      'Document mis à jour avec succès'
    ).send(res);
  });

  /**
   * Deletes a document by its ID.
   *
   * @route  DELETE /editor/:documentId
   * @access Authenticated
   *
   * @returns
   *   - 200 { data: { id: string } }
   *   - 404 document not found
   */
  deleteDocument = asyncHandler(async (req, res) => {
    const documentId = Array.isArray(req.params.documentId)
      ? req.params.documentId[0]
      : req.params.documentId;

    const document = await this.editorService.getDocumentById(documentId);

    if (!document) {
      return HttpResponse.notFound('Document introuvable').send(res);
    }

    await this.editorService.deleteDocument(documentId);

    HttpResponse.success(
      { id: documentId },
      'Document supprimé avec succès'
    ).send(res);
  });

  /**
   * Saves a document with full content and metadata (both HTML and TipTap JSON).
   *
   * @route  POST /editor/:documentId/save
   * @access Authenticated
   *
   * @body   { title?: string, content?: string, json?: object, wordCount?: number, emoji?: string, color?: string }
   *
   * @returns
   *   - 200 { data: Document }
   *   - 404 document not found
   */
  saveDocument = asyncHandler(async (req, res) => {
    const documentId = Array.isArray(req.params.documentId)
      ? req.params.documentId[0]
      : req.params.documentId;
    const { title, content, json, wordCount, emoji, color } = req.body;

    const document = await this.editorService.saveDocument(documentId, {
      title,
      content,
      json,
      wordCount,
      emoji,
      color,
    });

    HttpResponse.success(document, 'Document enregistré avec succès').send(res);
  });
}
