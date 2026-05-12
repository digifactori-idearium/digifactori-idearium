import { Ideorama, Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import { IIdeoramaService } from '@/types';
import { generateToken } from '@/utils/generate-token';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');

  return {
    ...actualFs,
    readFileSync: jest.fn(),
    unlink: jest.fn(),
    writeFileSync: jest.fn(),
  };
});

jest.mock('@/utils/storage.service', () => ({
  uploadFile: jest.fn().mockResolvedValue('scene-key.json'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
}));

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';
const FAKE_IDEORAMA_ID = 'id';

function createFakeUser(overrides: Partial<User> = {}): User {
  return {
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

function createFakeIdeorama(overrides: Partial<Ideorama> = {}): {
  ideorama: Ideorama;
  ideoramaJSON: Record<string, unknown>;
} {
  const ideorama: Ideorama = {
    id: FAKE_IDEORAMA_ID,
    name: 'test',
    isPublic: true,
    scene: 'scene-key.json',
    userId: FAKE_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  const ideoramaJSON = {
    ...ideorama,
    createdAt: ideorama.createdAt.toISOString(),
    updatedAt: ideorama.updatedAt.toISOString(),
  };

  return {
    ideorama,
    ideoramaJSON,
  };
}

class MockIdeoramaService implements IIdeoramaService {
  getIdeoramas = jest.fn<Promise<Ideorama[]>, []>();

  createIdeorama = jest.fn<Promise<Ideorama>, [Partial<Ideorama>]>();

  getIdeoramaById = jest.fn<Promise<Ideorama | null>, [string]>();

  saveScene = jest.fn<Promise<Ideorama>, [string, any, any]>();

  getUserIdeoramas = jest.fn<Promise<Ideorama[]>, [string]>();

  updateIdeorama = jest.fn<Promise<Ideorama>, [string, any]>();

  isIdeoramaInBD = jest.fn<Promise<boolean>, [string]>();

  likeIdeorama = jest.fn<
    Promise<{
      isLiked: boolean;
      likersCount: number;
    }>,
    [string, string]
  >();

  deleteIdeorama = jest.fn<Promise<Ideorama>, [string]>();
}

let token: string;
let mockService: MockIdeoramaService;
let app: express.Express;

const authHeader = () => `Bearer ${token}`;

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

afterAll(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('PATCH /:ideoramaId/save', () => {
  it('should save the scene successfully', async () => {
    const { ideorama } = createFakeIdeorama();
    mockService.getIdeoramaById.mockResolvedValue(ideorama);
    mockService.saveScene.mockResolvedValue(ideorama);

    const sceneContent = JSON.stringify({ objects: {} });

    const res = await request(app)
      .patch(`/api/ideorama/${FAKE_IDEORAMA_ID}/save`)
      .set('Authorization', authHeader())
      .field(
        'meta',
        JSON.stringify({
          name: 'Updated Ideorama',
          isPublic: true,
        })
      )
      .attach('file', Buffer.from(sceneContent), 'scene.json');

    expect(res.status).toBe(200);
    expect(mockService.saveScene).toHaveBeenCalled();
  });
  it('should return 404 if ideorama does not exist', async () => {
    mockService.getIdeoramaById.mockResolvedValue(null);

    const scene = JSON.stringify({
      objects: {},
    });

    const res = await request(app)
      .patch(`/api/ideorama/${FAKE_IDEORAMA_ID}/save`)
      .set('Authorization', authHeader())
      .field(
        'meta',
        JSON.stringify({
          name: 'Updated Ideorama',
        })
      )
      .attach('scene', Buffer.from(scene), 'scene.json');

    expect(res.status).toBe(404);
  });
});
