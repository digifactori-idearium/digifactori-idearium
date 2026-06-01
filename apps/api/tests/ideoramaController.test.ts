import { Ideorama, Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import { IIdeoramaService } from '@/types';
import { generateToken } from '@/utils/generate-token';

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';
const FAKE_IDEORAMA_ID = 'id';

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

function createFakeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profileId',
    userId: 'cmnup6jyf0000p0utn33xhdpq',
    pseudo: 'TestUser',
    avatar: null,
    bio: null,
    voiceButtons: true,
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
    id: 'id',
    name: 'test',
    isPublic: true,
    scene: 'path',
    userId: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  const ideoramaJSON = {
    ...ideorama,
    createdAt: ideorama.createdAt.toISOString(),
    updatedAt: ideorama.updatedAt.toISOString(),
  };

  return { ideorama, ideoramaJSON };
}

const authHeader = () => 'Bearer ' + token;

class MockIdeoramaService implements IIdeoramaService {
  createIdeorama = jest.fn<Promise<Ideorama>, [Partial<Ideorama>]>();
  getIdeoramaById = jest.fn<Promise<Ideorama | null>, [string]>();
  saveScene = jest.fn<Promise<Ideorama>, [string, any, any]>();
  getIdeoramas = jest.fn<Promise<Ideorama[]>, []>();
  getUserIdeoramas = jest.fn<Promise<Ideorama[]>, [string]>();
  updateIdeorama = jest.fn<Promise<Ideorama>, [string, any]>();
  isIdeoramaInBD = jest.fn<Promise<boolean>, [string]>();
  likeIdeorama = jest.fn<
    Promise<{ isLiked: boolean; likersCount: number }>,
    [string, string]
  >();
  deleteIdeorama = jest.fn<Promise<Ideorama>, [string]>();
}

let token: string;
let mockService!: MockIdeoramaService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(createFakeUser(), createFakeProfile()) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockIdeoramaService();
  app = express();
  app.use(express.json());
  app.use('/api/ideorama', createIdeoramaRoutes(mockService));
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Ideorama handling', () => {
  describe('GET /ideorama/:ideoramaId', () => {
    it('should return the ideorama found with its id', async () => {
      const { ideorama, ideoramaJSON } = createFakeIdeorama({ scene: '{}' });
      mockService.getIdeoramaById.mockResolvedValue(ideorama);

      const res = await request(app)
        .get(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(res.body.data).toEqual(ideoramaJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the ideorama is not present', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(
        FAKE_IDEORAMA_ID
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /ideorama/', () => {
    it('should create an ideorama correctly', async () => {
      const { ideorama, ideoramaJSON } = createFakeIdeorama();
      // const user = createFakeUser();
      mockService.createIdeorama.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/')
        .set('Authorization', authHeader())
        .send({ name: ideorama.name });

      expect(mockService.createIdeorama).toHaveBeenCalledWith(
        expect.objectContaining({
          name: ideorama.name,
          userId: FAKE_USER_ID,
        })
      );
      expect(res.body.data).toEqual(ideoramaJSON);
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ id: ideoramaJSON.id });
    });
  });

  describe('PATCH /:ideoramaId/save', () => {
    it('should save the scene file and return 200', async () => {
      const { ideorama } = createFakeIdeorama();
      // The controller re-fetches the ideorama to delete the old scene file.
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      mockService.saveScene.mockResolvedValue(ideorama);

      const sceneBlob = JSON.stringify({ objects: {} });
      const meta = JSON.stringify({ name: 'test', isPublic: true });

      const res = await request(app)
        .patch(`/api/ideorama/${FAKE_IDEORAMA_ID}/save`)
        .set('Authorization', authHeader())
        .field('meta', meta)
        .attach('file', Buffer.from(sceneBlob), {
          filename: `${FAKE_IDEORAMA_ID}.json`,
          contentType: 'application/json',
        });

      expect(mockService.saveScene).toHaveBeenCalledWith(
        FAKE_IDEORAMA_ID,
        'scenes/id.json',
        expect.objectContaining({ name: 'test', isPublic: true })
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 if the ideorama does not exist', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const sceneBlob = JSON.stringify({ objects: {} });
      const meta = JSON.stringify({ name: 'test', isPublic: true });

      const res = await request(app)
        .patch(`/api/ideorama/${FAKE_IDEORAMA_ID}/save`)
        .set('Authorization', authHeader())
        .field('meta', meta)
        .attach('file', Buffer.from(sceneBlob), {
          filename: `${FAKE_IDEORAMA_ID}.json`,
          contentType: 'application/json',
        });

      expect(mockService.saveScene).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('GET ideorama/', () => {
    it('should return all ideoramas of a user', async () => {
      const { ideorama, ideoramaJSON } = createFakeIdeorama();
      mockService.getUserIdeoramas.mockResolvedValue([ideorama]);

      const res = await request(app)
        .get('/api/ideorama/')
        .set('Authorization', authHeader());

      expect(mockService.getUserIdeoramas).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data).toEqual([ideoramaJSON]);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /ideorama/:ideoramaId/like', () => {
    it('should like the ideorama', async () => {
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      mockService.likeIdeorama.mockResolvedValue({
        isLiked: true,
        likersCount: 1,
      });

      const res = await request(app)
        .post(`/api/ideorama/${FAKE_IDEORAMA_ID}/like`)
        .set('Authorization', authHeader());

      expect(mockService.likeIdeorama).toHaveBeenCalledWith(
        FAKE_IDEORAMA_ID,
        FAKE_USER_ID
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 if the ideorama to like is not found', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/ideorama/${FAKE_IDEORAMA_ID}/like`)
        .set('Authorization', authHeader());

      expect(mockService.likeIdeorama).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE ideorama/:ideoramaId', () => {
    it('should delete the ideorama', async () => {
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      mockService.deleteIdeorama.mockResolvedValue(ideorama);

      const res = await request(app)
        .delete(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.deleteIdeorama).toHaveBeenCalledWith(FAKE_IDEORAMA_ID);
      expect(res.status).toBe(204);
    });

    it('should return 404 if the ideorama is not found', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.deleteIdeorama).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('GET /ideorama/empty', () => {
    it('should return the empty ideorama', async () => {
      const res = await request(app)
        .get('/api/ideorama/empty')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ objects: {} });
    });
  });
});
