import { Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createProfileRoutes from '@/modules/profile/profile.route';
import { IProfileService } from '@/types';
import { generateToken } from '@/utils/generate-token';
let token;

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

function createFakeProfile(overrides = {}): Profile {
  const profile: Profile = {
    id: 'profileId',
    userId: 'cmnup6jyf0000p0utn33xhdpq',
    pseudo: 'TestUser',
    avatar: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  return profile;
}

class MockProfileService implements IProfileService {
    verifyPassword = jest.fn<Promise<boolean>, [string, string]>();
    getSingleProfile = jest.fn<Promise<Profile | null>, [string]>();
    getSingleUser = jest.fn<Promise<User | null>, [string]>();
    updateProfile = jest.fn<Promise<{ user?: User; profile: Profile }>, [string, SetProfileInput]>();
    followUser = jest.fn<Promise<boolean>, [string, string]>();
    getFollowers = jest.fn<Promise<{ pseudo: string; avatar: string | null }[]>, [string]>();
    getFollowing = jest.fn<Promise<{ pseudo: string; avatar: string | null }[]>, [string]>();
    deleteUser = jest.fn<Promise<{ user: User; profile: Profile }>, [string]>();
}

beforeAll(async () => {
  token = generateToken(createFakeUser());
});

describe('Profile Handling', () => {
  describe('GET /profile', () => {
    it('should get the profile of the authenticated user', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const profile = createFakeProfile();
      mockService.getSingleProfile.mockResolvedValue(profile);

      const res = await request(app)
        .get('/api/profile/')
        .set('Authorization', `Bearer ${token}`);

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the profile is not found', async () => {
      const app = express();
      const mockService = new MockProfileService();
      mockService.getSingleProfile.mockResolvedValue(null);
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));

      const res = await request(app)
        .get('/api/profile/')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
})