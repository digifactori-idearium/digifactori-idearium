import fs from 'fs';

import { Profile, User, VoxelModel } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createVoxelRoutes from '@/modules/voxel/voxel.route';
import { IVoxelService } from '@/types';
import { generateToken } from '@/utils/generate-token';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  unlink: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('@/utils/storage.service', () => ({
  uploadFile: jest.fn().mockResolvedValue('file-key'),
  deleteFile: jest.fn().mockResolvedValue(true),
}));

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';
const FAKE_MODEL_ID = 'id';

function createFakeUser(overrides = {}): User {
  const user: User = {
    id: FAKE_USER_ID,
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

function createFakeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profileId',
    userId: FAKE_USER_ID,
    pseudo: 'TestUser',
    avatar: null,
    bio: null,
    voiceButtons: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createFakeModel(overrides = {}): {
  model: VoxelModel;
  modelJSON: any;
} {
  const model: VoxelModel = {
    id: 'id',
    name: 'test',
    model: 'path',
    userId: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  const modelJSON = {
    ...model,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };

  return { model: model, modelJSON: modelJSON };
}

const authHeader = () => 'Bearer ' + token;

class MockVoxelService implements IVoxelService {
  createVoxelModel = jest.fn<
    Promise<VoxelModel>,
    [{ name?: string; userId: string }]
  >();
  updateVoxelModelFileKey = jest.fn<Promise<VoxelModel>, [string, string]>();
  getVoxelModelById = jest.fn<Promise<VoxelModel | null>, [string]>();
  getVoxelModels = jest.fn<Promise<VoxelModel[]>, []>();
  getUserVoxelModels = jest.fn<Promise<VoxelModel[]>, [string]>();
  deleteVoxelModel = jest.fn<Promise<VoxelModel>, [string]>();
}

let token: string;
let mockService!: MockVoxelService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(createFakeUser(), createFakeProfile()) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockVoxelService();
  app = express();
  app.use(express.json());
  app.use('/api/voxel', createVoxelRoutes(mockService));
});

describe('Voxel model handling', () => {
  describe('GET /voxel/:voxelModelId', () => {
    it('should get the voxel model with the corresponding id', async () => {
      const { model, modelJSON } = createFakeModel({ model: {} });
      mockService.getVoxelModelById.mockResolvedValue(model);
      (fs.readFileSync as jest.Mock).mockReturnValue('{}');

      const res = await request(app)
        .get(`/api/voxel/${model.id}`)
        .set('Authorization', authHeader());

      expect(mockService.getVoxelModelById).toHaveBeenCalledWith(model.id);
      expect(res.body.data).toEqual(modelJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the model is not found', async () => {
      mockService.getVoxelModelById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/voxel/${'notFound'}`)
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('POST /voxel', () => {
    it('should create the model', async () => {
      const { model, modelJSON } = createFakeModel();
      mockService.createVoxelModel.mockResolvedValue(model);

      const res = await request(app)
        .post('/api/voxel/')
        .set('Authorization', authHeader())
        .send({ name: model.name });

      expect(mockService.createVoxelModel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: model.name,
          userId: FAKE_USER_ID,
        })
      );
      expect(res.body.data).toEqual(modelJSON);
      expect(res.status).toBe(201);
    });
  });

  describe('PATCH /voxel/:voxelModelId/save', () => {
    it('should save the voxel model with GLB file', async () => {
      const { model } = createFakeModel();
      mockService.getVoxelModelById.mockResolvedValue(model);
      mockService.updateVoxelModelFileKey.mockResolvedValue(model);

      const res = await request(app)
        .patch(`/api/voxel/${model.id}/save`)
        .set('Authorization', authHeader())
        .attach('file', Buffer.from('fake glb'), 'model.glb');

      expect(mockService.updateVoxelModelFileKey).toHaveBeenCalledWith(
        model.id,
        expect.any(String)
      );
      expect(res.status).toBe(200);
    });

    it('should return 400 if no GLB file is provided', async () => {
      const { model } = createFakeModel();
      mockService.getVoxelModelById.mockResolvedValue(model);

      const res = await request(app)
        .patch(`/api/voxel/${model.id}/save`)
        .set('Authorization', authHeader());

      expect(mockService.updateVoxelModelFileKey).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 404 if the model does not exist', async () => {
      mockService.getVoxelModelById.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/voxel/${FAKE_MODEL_ID}/save`)
        .set('Authorization', authHeader())
        .attach('file', Buffer.from('fake glb'), 'model.glb');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /voxel', () => {
    it('should get all voxel models of the authenticated user', async () => {
      const { model, modelJSON } = createFakeModel();
      mockService.getUserVoxelModels.mockResolvedValue([model]);

      const res = await request(app)
        .get('/api/voxel')
        .set('Authorization', authHeader());

      expect(mockService.getUserVoxelModels).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data).toEqual([modelJSON]);
      expect(res.status).toBe(200);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/voxel/');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /voxel/:voxelModelId', () => {
    it('should delete the model', async () => {
      const { model } = createFakeModel();
      mockService.getVoxelModelById.mockResolvedValue(model);
      mockService.deleteVoxelModel.mockResolvedValue(model);

      const res = await request(app)
        .delete(`/api/voxel/${model.id}`)
        .set('Authorization', authHeader());

      expect(mockService.deleteVoxelModel).toHaveBeenCalledWith(model.id);
      expect(res.status).toBe(204);
    });

    it('should return 404 if the model is not found', async () => {
      mockService.getVoxelModelById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/voxel/${FAKE_MODEL_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.deleteVoxelModel).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalledWith();
      expect(res.status).toBe(404);
    });
  });
});
