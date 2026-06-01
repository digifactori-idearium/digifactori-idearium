import { prisma } from '@/config/client.config';
import { IEditorService } from '@/types';

const documentTable = prisma.document;

export default class EditorService implements IEditorService {
  /**
   * Creates a new document
   *
   * @param data - the document data ({ title?: string; content?: string; json?: Record<string, any>; wordCount?: number; emoji?: string; color?: string; userId: string })
   * @returns The created document as Promise<Document>
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
  }

  /**
   * Gets all documents for a user
   *
   * @param userId - the id of the user whose documents we want to retrieve (string)
   * @returns An array of documents as Promise<Document[]>
   */
  async getUserDocuments(userId: string) {
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
  }

  /**
   * Gets a single document by ID
   *
   * @param documentId - the id of the document to retrieve (string)
   * @returns The found document as Promise<Document>, or Promise<null> if not found
   */
  async getDocumentById(documentId: string) {
    const document = await documentTable.findUnique({
      where: {
        id: documentId,
      },
      include: {
        user: true,
      },
    });

    return document;
  }

  /**
   * Updates a document
   *
   * @param documentId - the id of the document to update (string)
   * @param data - the new document data ({ title?: string; content?: string; json?: Record<string, any>; wordCount?: number; emoji?: string; color?: string })
   * @returns The updated document as Promise<Document>
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
  }

  /**
   * Deletes a document
   *
   * @param documentId - the id of the document to delete (string)
   * @returns The deleted document as Promise<Document>
   */
  async deleteDocument(documentId: string) {
    const deletedDocument = await documentTable.delete({
      where: {
        id: documentId,
      },
    });

    return deletedDocument;
  }

  /**
   * Saves document with both HTML content and TipTap JSON
   * @param documentId - the id of the document to save (string)
   * @param data - the new document data ({ title: string; content: string; json?: Record<string, any>; wordCount: number; emoji?: string; color?: string })
   * @returns The updated document as Promise<Document>
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
  }
}
