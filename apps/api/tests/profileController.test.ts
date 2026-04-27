import { Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createProfileRoutes from '@/modules/profile/profile.route';
import { IProfileService } from '@/types';
import { generateToken } from '@/utils/generate-token';
let token;

function createFakeUser(overrides = {}): {user: User, userJSON: any} {
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
  const userJSON = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
  return { user, userJSON };
}

function createFakeProfile(overrides = {}): {profile: Profile, profileJSON: any} {
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
  const profileJSON = {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
  return { profile, profileJSON };
}

class MockProfileService implements IProfileService {
  verifyPassword = jest.fn<Promise<boolean>, [string, string]>();
  getSingleProfile = jest.fn<Promise<Profile | null>, [string]>();
  getSingleUser = jest.fn<Promise<User | null>, [string]>();
  updateProfile = jest.fn<
    Promise<{ user?: User; profile: Profile }>,
    [string, SetProfileInput]
  >();
  followUser = jest.fn<Promise<boolean>, [string, string]>();
  getFollowers = jest.fn<
    Promise<{ pseudo: string; avatar: string | null }[]>,
    [string]
  >();
  getFollowing = jest.fn<
    Promise<{ pseudo: string; avatar: string | null }[]>,
    [string]
  >();
  deleteUser = jest.fn<Promise<{ user: User; profile: Profile }>, [string]>();
}

beforeAll(async () => {
  const {user} = createFakeUser();
  token = generateToken(user);
});

describe('Profile Handling', () => {
  describe('GET /profile', () => {
    it('should get the profile of the authenticated user', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const { profile, profileJSON } = createFakeProfile();
      mockService.getSingleProfile.mockResolvedValue(profile);

      const res = await request(app)
        .get('/api/profile/')
        .set('Authorization', `Bearer ${token}`);

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.body.data.profile).toEqual(profileJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the profile is not found', async () => {
      const app = express();
      const mockService = new MockProfileService();
      mockService.getSingleProfile.mockResolvedValue(null);
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const { profile } = createFakeProfile();

      const res = await request(app)
        .get('/api/profile/')
        .set('Authorization', `Bearer ${token}`);

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /profile/user', () => {
    it('should get the user data of the authenticated user', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const { user, userJSON } = createFakeUser();
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/profile/user')
        .set('Authorization', `Bearer ${token}`)
        .send({ parental_code: '2026' });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toEqual(userJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the user is not found', async () => {
      const app = express();
      const mockService = new MockProfileService();
      mockService.getSingleUser.mockResolvedValue(null);
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user} = createFakeUser();
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/profile/user')
        .set('Authorization', `Bearer ${token}`);

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.status).toBe(404);
    });

    it('should return null user if the parental code is invalid and the user is an intern', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user} = createFakeUser({ role: 'INTERN' });
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/profile/user')
        .set('Authorization', `Bearer ${token}`)
        .send({ parental_code: 'invalid_code' });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toBeNull();
      expect(res.status).toBe(200);
    });

    it('should return the user if the parental code is invalid but the user is not an intern', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user, userJSON} = createFakeUser({ role: 'EMPLOYEE' });
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/profile/user')
        .set('Authorization', `Bearer ${token}`)
        .send({ parental_code: 'invalid_code' });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toEqual(userJSON);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /profile/setting', () => {
    it('should update the profile and user data of the authenticated user', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user: newUser, userJSON: newUserJSON} = createFakeUser({ first_name: 'NewFirstName' });
      const {profile: newProfile, profileJSON: newProfileJSON} = createFakeProfile({ pseudo: 'NewPseudo' });
      mockService.updateProfile.mockResolvedValue({ user: newUser, profile: newProfile});

      const res = await request(app)
        .post('/api/profile/setting')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: newUser,
          profile: newProfile,
        });
      
      expect(mockService.updateProfile).toHaveBeenCalledWith(newUser.id, {
        user: newUserJSON,
        profile: newProfileJSON,
      });
      expect(res.body.data.user).toEqual(newUserJSON);
      expect(res.body.data.profile).toEqual(newProfileJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the profile to update is not found', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user: newUser, userJSON: newUserJSON} = createFakeUser({ first_name: 'NewFirstName' });
      const {profile: newProfile, profileJSON: newProfileJSON} = createFakeProfile({ pseudo: 'NewPseudo' });
      mockService.updateProfile.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/profile/setting')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: newUser,
          profile: newProfile,
        });

      expect(mockService.updateProfile).toHaveBeenCalledWith(newUser.id, {
        user: newUserJSON,
        profile: newProfileJSON,
      });
      expect(res.status).toBe(404);
    });
  });
  
  describe('POST /profile/find', () => {
    it('should get the profile of the user with the given id', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const { profile, profileJSON } = createFakeProfile();
      mockService.getSingleProfile.mockResolvedValue(profile);

      const res = await request(app)
        .post('/api/profile/find')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: profile.userId });

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.body.data.profile).toEqual(profileJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the profile is not found', async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const { profile } = createFakeProfile();
      mockService.getSingleProfile.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/profile/find')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: profile.userId });

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /profile/follow", () => {
    it("should follow a user", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user} = createFakeUser();
      const {user: followedUser} = createFakeUser({id: "followedUserId"});
      mockService.getSingleUser.mockResolvedValue(followedUser);
      mockService.followUser.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/profile/follow')
        .set('Authorization', `Bearer ${token}`)
        .send({ followedUserId: followedUser.id });

      expect(mockService.followUser).toHaveBeenCalledWith(user.id, followedUser.id);
      expect(res.body.data).toBe(true);
      expect(res.status).toBe(200);
    });

    it("should not allow a user to follow themselves", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user} = createFakeUser();

      const res = await request(app)
        .post('/api/profile/follow')
        .set('Authorization', `Bearer ${token}`)
        .send({ followedUserId: user.id });

      expect(mockService.followUser).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

     it("should return 404 if the user to follow is not found", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const followedUserId = "nonExistentUserId";
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/profile/follow')
        .set('Authorization', `Bearer ${token}`)
        .send({ followedUserId });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(followedUserId);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /profile/followers", () => {
    it("should get the followers of the authenticated user", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user} = createFakeUser();
      const followers = [
        { pseudo: "Follower1", avatar: null },
        { pseudo: "Follower2", avatar: null },
      ];
      mockService.getFollowers.mockResolvedValue(followers);

      const res = await request(app)
        .post('/api/profile/followers')
        .set('Authorization', `Bearer ${token}`)
        .send({userId: user.id});

      expect(mockService.getFollowers).toHaveBeenCalledWith(user.id);
      expect(res.body.data.followers).toEqual(followers);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /profile/following", () => {
    it("should get the following of the authenticated user", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user} = createFakeUser();
      const following = [
        { pseudo: "Following1", avatar: null },
        { pseudo: "Following2", avatar: null },
      ];
      mockService.getFollowing.mockResolvedValue(following);

      const res = await request(app)
        .post('/api/profile/following')
        .set('Authorization', `Bearer ${token}`)
        .send({userId: user.id});

      expect(mockService.getFollowing).toHaveBeenCalledWith(user.id);
      expect(res.body.data.following).toEqual(following);
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /profile", () => {
    it("should delete the authenticated user's account and profile", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      const {user, userJSON} = createFakeUser();
      const {profile, profileJSON} = createFakeProfile();
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.deleteUser.mockResolvedValue({ user, profile });

      const res = await request(app)
        .delete('/api/profile/delete')
        .set('Authorization', `Bearer ${token}`);
        
      expect(mockService.deleteUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toEqual(userJSON);
      expect(res.body.data.profile).toEqual(profileJSON);
      expect(res.status).toBe(200);
    });

    it("should return 404 if the user to delete is not found", async () => {
      const app = express();
      const mockService = new MockProfileService();
      app.use(express.json());
      app.use('/api/profile', createProfileRoutes(mockService));
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/profile/delete')
        .set('Authorization', `Bearer ${token}`);

      expect(mockService.deleteUser).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });
});
