import fs from 'fs';
import fsPromises from 'fs/promises';

import { User, VoxelModel } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createVoxelRoutes from '@/modules/voxel/voxel.route';
import { IVoxelService } from '@/types';
import { generateToken } from '@/utils/generate-token';
import { getVoxelModelUploadPath } from '@/utils/getUploadPath';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  unlink: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  access: jest.fn(),
}));

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';
const FAKE_MODEL_ID = 'id';

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
  createVoxelModel = jest.fn<Promise<VoxelModel>, [string, string]>();
  updateVoxelModelPath = jest.fn<Promise<VoxelModel>, [string, string]>();
  getVoxelModelById = jest.fn<Promise<VoxelModel | null>, [string]>();
  getUserVoxelModels = jest.fn<Promise<VoxelModel[]>, [string]>();
  deleteVoxelModel = jest.fn<Promise<VoxelModel>, [string]>();
}

let token: string;
let mockService!: MockVoxelService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(createFakeUser()) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockVoxelService();
  app = express();
  app.use(express.json());
  app.use('/api/voxel', createVoxelRoutes(mockService));
});

describe('Voxel model handling', () => {
  describe('POST /voxel', () => {
    it('should get the voxel model with the corresponding id', async () => {
      const { model, modelJSON } = createFakeModel({ model: {} });
      mockService.getVoxelModelById.mockResolvedValue(model);
      (fs.readFileSync as jest.Mock).mockReturnValue('{}');

      const res = await request(app)
        .post('/api/voxel/')
        .set('Authorization', authHeader())
        .send({ voxelModelId: model.id });

      expect(mockService.getVoxelModelById).toHaveBeenCalledWith(model.id);
      expect(res.body.data).toEqual(modelJSON);
      expect(res.status).toBe(200);
    });
  });

  it('should return 404 if the model is not found', async () => {
    mockService.getVoxelModelById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/voxel/')
      .set('Authorization', authHeader())
      .send({ voxelModelId: 'notFound' });

    expect(res.status).toBe(404);
  });

  describe('POST /voxel/create', () => {
    it('should create the model', async () => {
      const { model, modelJSON } = createFakeModel();
      mockService.createVoxelModel.mockResolvedValue(model);

      const res = await request(app)
        .post('/api/voxel/create')
        .set('Authorization', authHeader())
        .send({ voxelModel: { name: model.name } });

      expect(mockService.createVoxelModel).toHaveBeenCalledWith(
        model.name,
        FAKE_USER_ID
      );
      expect(res.body.data).toEqual(modelJSON);
      expect(res.status).toBe(201);
    });
  });

  describe('POST /voxel/save', () => {
    it('should save the model', async () => {
      const { model } = createFakeModel();
      (fsPromises.access as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/voxel/save')
        .set('Authorization', authHeader())
        .send({ voxelModelId: model.id, model: model.model });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        getVoxelModelUploadPath(model.id),
        model.model
      );
      expect(res.body.data).toBeUndefined();
      expect(res.status).toBe(200);
    });

    it('should return 404 if the file does not already exist', async () => {
      const { model } = createFakeModel();
      (fsPromises.access as jest.Mock).mockRejectedValue(
        new Error('not found')
      );

      const res = await request(app)
        .post('/api/voxel/save')
        .set('Authorization', authHeader())
        .send({ voxelModelId: model.id, model: model.model });

      expect(fsPromises.access).toHaveBeenCalledWith(
        getVoxelModelUploadPath(model.id)
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /voxel/all', () => {
    it('should get all voxel models of the authenticated user', async () => {
      const { model, modelJSON } = createFakeModel({ model: {} });
      mockService.getUserVoxelModels.mockResolvedValue([model]);

      const res = await request(app)
        .post('/api/voxel/all')
        .set('Authorization', authHeader())

      expect(mockService.getUserVoxelModels).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data).toEqual([modelJSON])
      expect(res.status).toBe(200);
    });
  });

  describe('POST /voxel/delete ', () => {
    it("should delete the model", async () => {
        const { model } = createFakeModel({ model: {} });
      mockService.getVoxelModelById.mockResolvedValue(model);

      const res = await request(app)
        .post('/api/voxel/delete')
        .set('Authorization', authHeader())
        .send({voxelModelId: model.id})

      expect(mockService.deleteVoxelModel).toHaveBeenCalledWith(model.id);
      expect(res.status).toBe(204);
    });

    it("should return 404 if the model is not found", async () => {
        const { model } = createFakeModel({ model: {} });
      mockService.getVoxelModelById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/voxel/delete')
        .set('Authorization', authHeader())
        .send({voxelModelId: model.id})

      expect(mockService.deleteVoxelModel).not.toHaveBeenCalled()
      expect(res.status).toBe(404);
    });
  })
});
