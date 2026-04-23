import fs from 'fs';
import path from 'path';

import { Ideorama } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import { IIdeoramaService } from '@/types';
import { generateToken } from '@/utils/generate-token';

let token;

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  unlink: jest.fn(),
  writeFileSync: jest.fn(),
}));

function createFakeIdeorama(overrides = {}): {
  ideorama: Ideorama;
  ideoramaJSON: any;
} {
  const ideorama: Ideorama = {
    id: 'id',
    name: 'test',
    description: null,
    theme: 'theme',
    brightness: 'bright',
    isPublic: true,
    backgroundColor: '#000',
    leftWallColor: '#000',
    rightWallColor: '#000',
    floorColor: '#000',
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

class MockIdeoramaService implements IIdeoramaService {
  createIdeorama = jest.fn<Promise<Ideorama>, [Ideorama]>();

  updateIdeoramaModelPath = jest.fn<Promise<Ideorama>, [string, string]>();

  getIdeoramaById = jest.fn<Promise<Ideorama | null>, [string]>();

  getUserIdeoramas = jest.fn<Promise<Ideorama[]>, [string]>();

  updateIdeorama = jest.fn<Promise<Ideorama>, [string, Ideorama]>();

  isIdeoramaInBD = jest.fn<Promise<boolean>, [string]>();

  likeIdeorama = jest.fn<Promise<boolean>, [string, string]>();

  deleteIdeorama = jest.fn<Promise<Ideorama>, [string]>();
}

beforeAll(async () => {
  token = generateToken({
    id: 'cmnup6jyf0000p0utn33xhdpq',
    email: 'gyfenfer1@gmail.com',
    first_name: 'Gauthier',
    last_name: 'Mambourg',
    password: '$2b$10$IyzVm9N/qexU6gD/fEoyz.9VeyRlcK4/UdsJYI3SNrVgV7ZUXz8r6',
    parental_code:
      '$2b$10$5gQSEfb2bYTl.v38bhJPteNnWu2YXrjbgARZ/QfOsh1EKwHkQIXI.',
    role: 'CHILD',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Ideorama handling', () => {
  describe('Ideorama creation', () => {
    it('should create an ideorama correctly', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const { ideorama, ideoramaJSON } = createFakeIdeorama();
      mockService.createIdeorama.mockResolvedValue(ideorama);

      const res = await request(app)
        .post('/api/ideorama/create')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideorama: ideorama });

      expect(mockService.createIdeorama).toHaveBeenCalledWith(ideoramaJSON);
      expect(mockService.updateIdeoramaModelPath).toHaveBeenCalledWith(
        ideorama.id,
        path.join(process.cwd(), 'uploads/scenes', `scene-${ideorama.id}.json`)
      );
      expect(res.body.data).toEqual(ideoramaJSON);
      expect(res.status).toBe(201);
    });
  });

  describe('Ideorama obtention', () => {
    it('should return all ideoramas of a user', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));

      const res = await request(app)
        .post('/api/ideorama/all')
        .set('Authorization', 'Bearer ' + token);

      expect(mockService.getUserIdeoramas).toHaveBeenCalledWith(
        'cmnup6jyf0000p0utn33xhdpq'
      );
      expect(res.status).toBe(200);
    });

    it('should return the ideorama found with its id', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const { ideorama, ideoramaJSON } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(ideorama);
      const readFileSyncMock = fs.readFileSync as jest.Mock;
      readFileSyncMock.mockReturnValue('{}');
      ideoramaJSON.model = {};

      const res = await request(app)
        .post('/api/ideorama/')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideorama.id });

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(res.body.data).toEqual(ideoramaJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the ideorama is not present', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const { ideorama } = createFakeIdeorama();
      mockService.getIdeoramaById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/ideorama/')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideorama.id });

      expect(mockService.getIdeoramaById).toHaveBeenCalledWith(ideorama.id);
      expect(res.status).toBe(404);
    });
  });

  describe('ideorama update', () => {
    it('should updates the file in the filesystem', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const { ideorama } = createFakeIdeorama();
      const writeFileSync = fs.readFileSync as jest.Mock;
      writeFileSync.mockReturnValue(null);

      const res = await request(app)
        .post('/api/ideorama/save')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideorama.id, ideorama: ideorama });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads/scenes', `scene-${ideorama.id}.json`),
        ideorama.model
      );
      expect(res.status).toBe(200);
    });
  });

  describe('Ideorama deletion', () => {
    it('should delete an ideorama correctly', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const ideoramaId = 'cmnup6jyf0000p0utn33xhdpq';

      const res = await request(app)
        .post('/api/ideorama/delete')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideoramaId });

      expect(mockService.deleteIdeorama).toHaveBeenCalledWith(ideoramaId);
      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads/scenes', `scene-${ideoramaId}.json`),
        expect.anything()
      );
      expect(res.status).toBe(204);
    });

    it('should fail to delete when the ideorama is not found', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      mockService.deleteIdeorama.mockRejectedValue(new Error('Not found'));
      const ideoramaId = 'cmnup6jyf0000p0utn33xhdpq';

      const res = await request(app)
        .post('/api/ideorama/delete')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideoramaId });

      expect(mockService.deleteIdeorama).toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(res.status).toBe(500);
    });
  });

  describe('Ideorama liking', () => {
    it('should like an ideorama correctly', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const ideoramaId = 'cmnup6jyf0000p0utn33xhdpq';
      mockService.likeIdeorama.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/ideorama/like')
        .set('Authorization', 'Bearer ' + token)
        .send({ ideoramaId: ideoramaId });

      expect(mockService.likeIdeorama).toHaveBeenCalledWith(ideoramaId, "cmnup6jyf0000p0utn33xhdpq");
      expect(res.status).toBe(200);
    });
  });

  describe('Empty ideorama', () => {
    it('should return the empty ideorama', async () => {
      const app = express();
      const mockService = new MockIdeoramaService();
      app.use(express.json());
      app.use('/api/ideorama', createIdeoramaRoutes(mockService));
      const readFileSyncMock = fs.readFileSync as jest.Mock;
      readFileSyncMock.mockReturnValue('{}');

      const res = await request(app).get('/api/ideorama/empty');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
