import { Ideorama, Prisma, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import { IIdeoramaService } from '@/types';
import { generateToken } from '@/utils/generate-token';

let token = '';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createFakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'cmnup6jyf0000p0utn33xhdpq',
    email: 'gyfenfer1@gmail.com',
    first_name: 'FirstName',
    last_name: 'LastName',
    password: '$2b$10$IyzVm9N/qexU6gD/fEoyz.9VeyRlcK4/UdsJYI3SNrVgV7ZUXz8r6',
    isActive: true,
    role: 'INTERN',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const EMPTY_SCENE = {
  global: {
    brightness: 'bright',
    visible: true,
    music: { currentTrack: '', volume: 0.5 },
    theme: 'day',
  },
  background: { color: '#8ecae6', accent: '#8ecae6' },
  info: { name: 'Template', description: 'New Ideorama', category: 'none' },
  floor: { color: '#53ED83', hidden: false, texture: 'none' },
  objects: {},
};

function createFakeIdeorama(overrides: Partial<Ideorama> = {}): {
  ideorama: Ideorama;
  ideoramaJSON: Record<string, unknown>;
} {
  const ideorama: Ideorama = {
    id: 'fake-ideorama-id',
    name: 'Test Ideorama',
    isPublic: true,
    scene: EMPTY_SCENE as unknown as Prisma.JsonValue,
    userId: 'cmnup6jyf0000p0utn33xhdpq',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };

  const ideoramaJSON = {
    ...ideorama,
    createdAt: ideorama.createdAt.toISOString(),
    updatedAt: ideorama.updatedAt.toISOString(),
  };

  return { ideorama, ideoramaJSON };
}

// ── Mock service ──────────────────────────────────────────────────────────────

class MockIdeoramaService implements IIdeoramaService {
  createIdeorama = jest.fn<Promise<Ideorama>, [Partial<Ideorama>]>();
  saveScene = jest.fn<Promise<Ideorama>, [string, Prisma.InputJsonValue]>();
  getIdeoramaById = jest.fn<Promise<Ideorama | null>, [string]>();
  getUserIdeoramas = jest.fn<Promise<Ideorama[]>, [string]>();
  updateIdeorama = jest.fn<
    Promise<Ideorama>,
    [string, Prisma.IdeoramaUpdateInput]
  >();
  isIdeoramaInBD = jest.fn<Promise<boolean>, [string]>();
  likeIdeorama = jest.fn<Promise<boolean>, [string, string]>();
  deleteIdeorama = jest.fn<Promise<Ideorama>, [string]>();
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeAll(() => {
  token = generateToken(createFakeUser()) ?? '';
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Ideorama handling', () => {
  describe('Ideorama creation', () => {
    it('should create an ideorama and return 201', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const { ideorama, ideoramaJSON } = createFakeIdeorama();
      mockService.createIdeorama.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/create')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideorama: { name: ideorama.name, userId: ideorama.userId } });

      expect(mockService.createIdeorama).toHaveBeenCalledWith({
        name: ideorama.name,
        userId: ideorama.userId,
      });
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ id: ideoramaJSON.id });
    });
  });

  describe('Ideorama retrieval', () => {
    it('should return all ideoramas for a user', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const user = createFakeUser();
      mockService.getUserIdeoramas.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/ideorama/all')
        .set('Authorization', 'Bearer ' + token)
        .send({ userId: user.id });

      expect(mockService.getUserIdeoramas).toHaveBeenCalledWith(user.id);
      expect(res.status).toBe(200);
    });

    it('should return the ideorama with its scene', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideorama.id });

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(res.status).toBe(200);
      expect(res.body.data.scene).toBeDefined();
    });

    it('should return 404 when ideorama is not found', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/ideorama/')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: 'nonexistent-id' });

      expect(res.status).toBe(404);
    });
  });

  describe('Ideorama save', () => {
    it('should save the scene to the DB and return 200', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      mockService.saveScene.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/save')
        .set('Authorization', 'Bearer ' + token)
        .send({
          ideoramaId: ideorama.id,
          ideorama: { scene: EMPTY_SCENE, userId: ideorama.userId },
        });

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(mockService.saveScene).toHaveBeenCalledWith(
        ideorama.id,
        EMPTY_SCENE
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 when saving to a nonexistent ideorama', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/ideorama/save')
        .set('Authorization', 'Bearer ' + token)
        .send({
          ideoramaId: 'nonexistent-id',
          ideorama: { scene: EMPTY_SCENE, userId: 'user-id' },
        });

      expect(res.status).toBe(404);
    });
  });

  describe('Ideorama deletion', () => {
    it('should delete an ideorama and return 204', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      mockService.deleteIdeorama.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/delete')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideorama.id });

      expect(mockService.deleteIdeorama).toHaveBeenCalledWith(ideorama.id);
      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting a nonexistent ideorama', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/ideorama/delete')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: 'nonexistent-id' });

      expect(res.status).toBe(404);
    });
  });

  describe('Ideorama liking', () => {
    it('should toggle like and return 200', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const { ideorama } = createFakeIdeorama();
      mockService.likeIdeorama.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/ideorama/like')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideorama.id });

      expect(mockService.likeIdeorama).toHaveBeenCalledWith(
        ideorama.id,
        createFakeUser().id
      );
      expect(res.status).toBe(200);
    });
  });

  describe('Empty ideorama template', () => {
    it('should return the empty scene template', async () => {
      const app = express();
      app.use(express.json());
      const mockService = new MockIdeoramaService();
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const res = await request(app).get('/api/ideorama/empty');

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ objects: {} });
    });
  });
});
