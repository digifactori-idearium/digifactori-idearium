import { Document, Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createEditorRoutes from '@/modules/editor/editor.route';
import { IEditorService } from '@/types';
import { generateToken } from '@/utils/generate-token';

const FAKE_USER_ID = 'fake-user-id';
const FAKE_DOCUMENT_ID = 'fake-document-id';

function createFakeUser(overrides = {}): { user: User; userJSON: any } {
  const user: User = {
    id: FAKE_USER_ID,
    email: 'pseudo@gmail.com',
    first_name: 'FirstName',
    last_name: 'LastName',
    password: '$2b$10$aczlvziUehGE4/qEWocFuO6cKjOPZK78O/fFy4YnfmY.jtcNnvz0m',
    isActive: true,
    role: 'INTERN',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  const userJSON = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
  return { user, userJSON };
}

function createFakeProfile(overrides = {}): {
  profile: Profile;
  profileJSON: any;
} {
  const profile = {
    id: 'fake-profile-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: FAKE_USER_ID,
    pseudo: 'fakePseudo',
    avatar: null,
    bio: null,
    voiceButtons: true,
    ...overrides,
  };
  const profileJSON = {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
  return { profile, profileJSON };
}

function createFakeDocument(overrides = {}): {
  document: Document;
  documentJSON: any;
} {
  const document: Document = {
    id: 'fake-document-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'Fake Document',
    content: 'Fake content',
    json: {},
    wordCount: 2,
    emoji: '🦛',
    color: '#ffffff',
    userId: 'fake-user-id',
    ...overrides,
  };
  const documentJSON = {
    ...document,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };

  return { document: document, documentJSON: documentJSON };
}

const authHeader = () => 'Bearer ' + token;

class MockEditorService implements IEditorService {
  createDocument = jest.fn<
    Promise<Document>,
    [
      {
        title?: string;
        content?: string;
        json?: Record<string, any>;
        wordCount?: number;
        emoji?: string;
        color?: string;
        userId: string;
      },
    ]
  >();
  getUserDocuments = jest.fn<Promise<Document[]>, [string]>();
  getDocumentById = jest.fn<Promise<Document | null>, [string]>();
  updateDocument = jest.fn<
    Promise<Document>,
    [
      string,
      {
        title?: string;
        content?: string;
        json?: Record<string, any>;
        wordCount?: number;
        emoji?: string;
        color?: string;
      },
    ]
  >();
  deleteDocument = jest.fn<Promise<Document>, [string]>();
  saveDocument = jest.fn<
    Promise<Document>,
    [
      string,
      {
        title?: string;
        content?: string;
        json?: Record<string, any>;
        wordCount?: number;
        emoji?: string;
        color?: string;
      },
    ]
  >();
}

let token: string;
let mockService!: MockEditorService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(
    createFakeUser().user,
    createFakeProfile().profile
  ) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockEditorService();
  app = express();
  app.use(express.json());
  app.use('/api/editor', createEditorRoutes(mockService));
});

describe('Document handling', () => {
  describe('GET editor/', () => {
    it('should return all documents of the authenticated user', async () => {
      const { document, documentJSON } = createFakeDocument();
      mockService.getUserDocuments.mockResolvedValue([document]);

      const res = await request(app)
        .get('/api/editor/')
        .set('Authorization', authHeader());

      expect(mockService.getUserDocuments).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data).toEqual([documentJSON]);
      expect(res.status).toBe(200);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/api/editor/}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /editor/:documentId', () => {
    it('should return the document', async () => {
      const { document, documentJSON } = createFakeDocument({ model: {} });
      mockService.getDocumentById.mockResolvedValue(document);

      const res = await request(app)
        .get(`/api/editor/${document.id}`)
        .set('Authorization', authHeader());

      expect(mockService.getDocumentById).toHaveBeenCalledWith(document.id);
      expect(res.body.data).toEqual(documentJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the document is not found', async () => {
      mockService.getDocumentById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/editor/${FAKE_DOCUMENT_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.getDocumentById).toHaveBeenCalledWith(
        FAKE_DOCUMENT_ID
      );
      expect(res.status).toBe(404);
    });
  });
  describe('POST /editor/', () => {
    it('should create a document correctly', async () => {
      const { document, documentJSON } = createFakeDocument();
      const { title, content, json, wordCount, emoji, color } = document;
      mockService.createDocument.mockResolvedValue(document);

      const res = await request(app)
        .post('/api/editor/')
        .set('Authorization', authHeader())
        .send(document);

      expect(mockService.createDocument).toHaveBeenCalledWith({
        title,
        content,
        json,
        wordCount,
        emoji,
        color,
        userId: FAKE_USER_ID,
      });
      expect(res.body.data).toEqual(documentJSON);
      expect(res.status).toBe(201);
    });
  });

  describe('POST /:documentId/save', () => {
    it('should save the document in DB', async () => {
      const { document, documentJSON } = createFakeDocument();
      const { title, content, json, wordCount, emoji, color } = document;
      mockService.getDocumentById.mockResolvedValue(document);
      mockService.saveDocument.mockResolvedValue(document);

      const res = await request(app)
        .post(`/api/editor/${document.id}/save`)
        .set('Authorization', authHeader())
        .send(document);

      expect(mockService.saveDocument).toHaveBeenCalledWith(document.id, {
        title,
        content,
        json,
        wordCount,
        emoji,
        color,
      });
      expect(res.body.data).toEqual(documentJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the document is not found', async () => {
      const { document } = createFakeDocument();
      mockService.getDocumentById.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/editor/${document.id}/save`)
        .set('Authorization', authHeader())
        .send(document);

      expect(mockService.saveDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /:documentId', () => {
    it('should update the document in DB', async () => {
      const { document, documentJSON } = createFakeDocument();
      const { title, content, json, wordCount, emoji, color } = document;
      mockService.getDocumentById.mockResolvedValue(document);
      mockService.updateDocument.mockResolvedValue(document);

      const res = await request(app)
        .patch(`/api/editor/${document.id}`)
        .set('Authorization', authHeader())
        .send(document);

      expect(mockService.updateDocument).toHaveBeenCalledWith(document.id, {
        title,
        content,
        json,
        wordCount,
        emoji,
        color,
      });
      expect(res.body.data).toEqual(documentJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the document is not found', async () => {
      const { document } = createFakeDocument();
      mockService.getDocumentById.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/editor/${document.id}`)
        .set('Authorization', authHeader())
        .send(document);

      expect(mockService.updateDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE editor/:documentId', () => {
    it('should delete the document', async () => {
      const { document } = createFakeDocument();
      mockService.getDocumentById.mockResolvedValue(document);

      const res = await request(app)
        .delete(`/api/editor/${document.id}`)
        .set('Authorization', authHeader());

      expect(mockService.deleteDocument).toHaveBeenCalledWith(document.id);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the document is not found', async () => {
      mockService.getDocumentById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/editor/${FAKE_DOCUMENT_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.deleteDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });
});
