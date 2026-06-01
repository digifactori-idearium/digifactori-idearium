import { Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createIdeaRoutes from '@/modules/idea/idea.route';
import { IIdeaService } from '@/types';
import { generateToken } from '@/utils/generate-token';

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';

class MockIdeaService implements IIdeaService {
  getIdeas = jest.fn<Promise<any>, [string]>();
  saveIdeas = jest.fn<Promise<any>, [string, any]>();
}

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

function createFakeIdeas(
  overrides: Partial<{ todo: any[]; progress: any[]; done: any[] }> = {}
) {
  return {
    todo: [
      {
        id: 'idea1',
        content: 'Idea 1...',
        priority: 'low',
        color: '#ddd6fe',
      },
    ],
    progress: [],
    done: [],
    ...overrides,
  };
}

let token: string;
let mockService: MockIdeaService;
let app!: express.Express;

const authHeader = () => `Bearer ${token}`;

beforeAll(async () => {
  token = generateToken(createFakeUser(), createFakeProfile()) as string;
});

beforeEach(() => {
  jest.clearAllMocks();

  mockService = new MockIdeaService();

  app = express();

  app.use(express.json());

  app.use('/api/ideas', createIdeaRoutes(mockService));
});

afterAll(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('GET /ideas', () => {
  it("should return the user's ideas", async () => {
    const ideas = createFakeIdeas();
    mockService.getIdeas.mockResolvedValue(ideas);

    const res = await request(app)
      .get('/api/ideas')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(ideas);
  });
});

describe('POST /ideas', () => {
  it("should save the user's ideas", async () => {
    const ideas = createFakeIdeas();
    mockService.saveIdeas.mockResolvedValue(ideas);

    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', authHeader())
      .send({ data: ideas });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(ideas);
  });

  it('should return 400 if validation fails', async () => {
    const invalidData = { invalid: 'data' };

    const res = await request(app)
      .post('/api/ideas')
      .set('Authorization', authHeader())
      .send({ data: invalidData });

    expect(res.status).toBe(400);
  });
});
