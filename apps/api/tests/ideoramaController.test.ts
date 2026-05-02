import fs from 'fs';

import { Ideorama, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import { IIdeoramaService } from '@/types';
import { generateToken } from '@/utils/generate-token';
import { getIdeoramaUploadPath } from '@/utils/getUploadPath';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  unlink: jest.fn(),
  writeFileSync: jest.fn(),
}));

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';
const FAKE_IDEORAMA_ID = 'id';

function createFakeUser(overrides = {}): User {
  const user: User = {
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
  return user;
}

function createFakeIdeorama(overrides = {}): {
  ideorama: Ideorama;
  ideoramaJSON: any;
} {
  const ideorama: Ideorama = {
    id: 'id',
    name: 'test',
    description: null,
    isPublic: true,
    model: 'path',
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

  return { ideorama: ideorama, ideoramaJSON: ideoramaJSON };
}

const authHeader = () => 'Bearer ' + token;

class MockIdeoramaService implements IIdeoramaService {
  createIdeorama = jest.fn<Promise<Ideorama>, [string, string]>();
  updateIdeoramaModelPath = jest.fn<Promise<Ideorama>, [string, string]>();
  getIdeoramaById = jest.fn<Promise<Ideorama | null>, [string]>();
  getUserIdeoramas = jest.fn<Promise<Ideorama[]>, [string]>();
  updateIdeorama = jest.fn<Promise<Ideorama>, [string, Ideorama]>();
  likeIdeorama = jest.fn<Promise<boolean>, [string, string]>();
  deleteIdeorama = jest.fn<Promise<Ideorama>, [string]>();
}

let token: string;
let mockService!: MockIdeoramaService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(createFakeUser()) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockIdeoramaService();
  app = express();
  app.use(express.json());
  app.use('/api/ideorama', createIdeoramaRoutes(mockService));
});

describe('Ideorama handling', () => {
  describe('GET /ideorama/:ideoramaId', () => {
    it('should return the ideorama found with its id', async () => {
      const { ideorama, ideoramaJSON } = createFakeIdeorama({ model: {} });
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      const readFileSyncMock = fs.readFileSync as jest.Mock;
      readFileSyncMock.mockReturnValue('{}');

      const res = await request(app)
        .get(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader())

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(res.body.data).toEqual(ideoramaJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the ideorama is not present', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader())

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(FAKE_IDEORAMA_ID);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /ideorama/', () => {
    it('should create an ideorama correctly', async () => {
      const { ideorama, ideoramaJSON } = createFakeIdeorama();
      const user = createFakeUser();
      mockService.createIdeorama.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/')
        .set('Authorization', authHeader())
        .send({ ideorama: ideorama });

      expect(mockService.createIdeorama).toHaveBeenCalledWith(
        ideorama.name,
        user.id
      );
      expect(mockService.updateIdeoramaModelPath).toHaveBeenCalledWith(
        ideorama.id,
        getIdeoramaUploadPath(ideorama.id)
      );
      expect(res.body.data).toEqual(ideoramaJSON);
      expect(res.status).toBe(201);
    });
  });

  describe('PATCH /:ideoramaId/save', () => {
    it('should update the ideorama in the filesystem', async () => {
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);

      const res = await request(app)
        .patch(`/api/ideorama/${FAKE_IDEORAMA_ID}/save`)
        .set('Authorization', authHeader())
        .send({ideorama: ideorama });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        getIdeoramaUploadPath(ideorama.id),
        ideorama.model
      );
      expect(res.body.data).toBeUndefined();
      expect(res.status).toBe(200);
    });

    it('should return 404 if the file does not already exist in the filesystem', async () => {
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(null);


      const res = await request(app)
        .patch(`/api/ideorama/${FAKE_IDEORAMA_ID}/save`)
        .set('Authorization', authHeader())
        .send({ideorama: ideorama });

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(fs.writeFileSync).not.toHaveBeenCalled()
      expect(res.status).toBe(404);
    });
  });

  describe('GET ideorama/', () => {
    it('should return all ideoramas of a user', async () => {
      const {ideorama, ideoramaJSON} = createFakeIdeorama()
      mockService.getUserIdeoramas.mockResolvedValue([ideorama]);

      const res = await request(app)
        .get('/api/ideorama/')
        .set('Authorization', authHeader());

      expect(mockService.getUserIdeoramas).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data).toEqual([ideoramaJSON]);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /ideorama/like', () => {
    it('should like the ideorama', async () => {
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      mockService.likeIdeorama.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/ideorama/like')
        .set('Authorization', authHeader())
        .send({ ideoramaId: ideorama.id });

      expect(mockService.likeIdeorama).toHaveBeenCalledWith(
        ideorama.id,
        FAKE_USER_ID
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 if the ideorama to like is not found', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/ideorama/like')
        .set('Authorization', authHeader())
        .send({ ideoramaId: FAKE_IDEORAMA_ID });

      expect(mockService.likeIdeorama).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE ideorama/:ideoramaId', () => {
    it('should delete the ideorama', async () => {
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);

      const res = await request(app)
        .delete(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader())
      

      expect(mockService.deleteIdeorama).toHaveBeenCalledWith(ideorama.id);
      expect(fs.unlink).toHaveBeenCalledWith(
        getIdeoramaUploadPath(ideorama.id),
        expect.anything()
      );
      expect(res.status).toBe(204);
    });

    it('should return 404 if the ideorama is not found', async () => {
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/ideorama/${FAKE_IDEORAMA_ID}`)
        .set('Authorization', authHeader())

      expect(mockService.deleteIdeorama).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('GET /ideorama/empty', () => {
    it('should return the empty ideorama', async () => {
      const readFileSyncMock = fs.readFileSync as jest.Mock;
      readFileSyncMock.mockReturnValue('{}');

      const res = await request(app).get('/api/ideorama/empty')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
