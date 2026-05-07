import { prisma } from '@/config/client.config';
import { IEditorService } from '@/types';
import { errorMessage } from '@/utils/errors';

const documentTable = prisma.document;

export default class EditorService implements IEditorService {
  /**
   * Create a new document
   */
  async createDocument(data: {
    title?: string;
    content?: string;
    json?: Record<string, any>;
    wordCount?: number;
    emoji?: string;
    color?: string;
    userId: string;
  }) {
    try {
      const newDocument = await documentTable.create({
        data: {
          title: data.title || 'Sans titre',
          content: data.content || '',
          ...(data.json !== undefined && { json: data.json }),
          wordCount: data.wordCount || 0,
          emoji: data.emoji || '📝',
          color: data.color || '#a78bfa',
          userId: data.userId,
        },
        include: {
          user: true,
        },
      });

      return newDocument;
    } catch (error) {
      throw new Error(
        `Erreur lors de la création du document: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: string) {
    try {
      const documents = await documentTable.findMany({
        where: {
          userId,
        },
        include: {
          user: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return documents;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des documents: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(documentId: string) {
    try {
      const document = await documentTable.findUnique({
        where: {
          id: documentId,
        },
        include: {
          user: true,
        },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      return document;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du document: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Update a document
   */
  async updateDocument(
    documentId: string,
    data: {
      title?: string;
      content?: string;
      json?: Record<string, any>;
      wordCount?: number;
      emoji?: string;
      color?: string;
    }
  ) {
    try {
      const updatedDocument = await documentTable.update({
        where: {
          id: documentId,
        },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.json !== undefined && { json: data.json }),
          ...(data.wordCount !== undefined && { wordCount: data.wordCount }),
          ...(data.emoji !== undefined && { emoji: data.emoji }),
          ...(data.color !== undefined && { color: data.color }),
        },
        include: {
          user: true,
        },
      });

      return updatedDocument;
    } catch (error) {
      throw new Error(
        `Erreur lors de la mise à jour du document: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string) {
    try {
      const deletedDocument = await documentTable.delete({
        where: {
          id: documentId,
        },
      });

      return deletedDocument;
    } catch (error) {
      throw new Error(
        `Erreur lors de la suppression du document: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Save document with both HTML content and TipTap JSON
   */
  async saveDocument(
    documentId: string,
    data: {
      title: string;
      content: string;
      json?: Record<string, any>;
      wordCount: number;
      emoji?: string;
      color?: string;
    }
  ) {
    try {
      const updatedDocument = await documentTable.update({
        where: {
          id: documentId,
        },
        data: {
          title: data.title,
          content: data.content,
          ...(data.json !== undefined && { json: data.json }),
          wordCount: data.wordCount,
          ...(data.emoji && { emoji: data.emoji }),
          ...(data.color && { color: data.color }),
        },
        include: {
          user: true,
        },
      });

      return updatedDocument;
    } catch (error) {
      throw new Error(
        `Erreur lors de la sauvegarde du document: ${errorMessage(error)}`
      );
    }
  }
}
