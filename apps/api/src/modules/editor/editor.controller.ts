import { IEditorService } from '@/types';
import asyncHandler from '@/utils/async-handler';
import HttpResponse from '@/utils/http-response';

export default class EditorController {
  constructor(private readonly editorService: IEditorService) {}

  /**
   * Create a new document
   *
   * @description Creates a new document for the authenticated user
   * @param {Request} req - Express request with userId from auth middleware
   * @param {Response} res - Express response object
   * @returns {Response} JSON response with created document
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
   * Get all documents for the authenticated user
   *
   * @description Retrieves all documents belonging to the authenticated user
   * @param {Request} req - Express request with userId from auth middleware
   * @param {Response} res - Express response object
   * @returns {Response} JSON response with array of documents
   */
  getUserDocuments = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;

    const documents = await this.editorService.getUserDocuments(userId);

    HttpResponse.success(documents, 'Documents retrieved successfully').send(
      res
    );
  });

  /**
   * Get a single document by ID
   *
   * @description Retrieves a specific document by its ID
   * @param {Request} req - Express request with documentId in params
   * @param {Response} res - Express response object
   * @returns {Response} JSON response with document data
   */
  getDocumentById = asyncHandler(async (req, res) => {
    const documentId = Array.isArray(req.params.documentId)
      ? req.params.documentId[0]
      : req.params.documentId;

    const document = await this.editorService.getDocumentById(documentId);

    HttpResponse.success(document, 'Document retrieved successfully').send(res);
  });

  /**
   * Update a document
   *
   * @description Updates an existing document with new data
   * @param {Request} req - Express request with documentId in params and update data in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response with updated document
   */
  updateDocument = asyncHandler(async (req, res) => {
    const documentId = Array.isArray(req.params.documentId)
      ? req.params.documentId[0]
      : req.params.documentId;
    const { title, content, json, wordCount, emoji, color } = req.body;

    const document = await this.editorService.updateDocument(documentId, {
      title,
      content,
      json,
      wordCount,
      emoji,
      color,
    });

    HttpResponse.success(document, 'Document mis à jour avec succès').send(res);
  });

  /**
   * Delete a document
   *
   * @description Deletes a document by its ID
   * @param {Request} req - Express request with documentId in params
   * @param {Response} res - Express response object
   * @returns {Response} JSON response confirming deletion
   */
  deleteDocument = asyncHandler(async (req, res) => {
    const documentId = Array.isArray(req.params.documentId)
      ? req.params.documentId[0]
      : req.params.documentId;

    await this.editorService.deleteDocument(documentId);

    HttpResponse.success(
      { id: documentId },
      'Document supprimé avec succès'
    ).send(res);
  });

  /**
   * Save document with full content and metadata
   *
   * @description Saves a document with both HTML content and TipTap JSON format
   * @param {Request} req - Express request with documentId in params and full document data in body
   * @param {Response} res - Express response object
   * @returns {Response} JSON response with saved document
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
