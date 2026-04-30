import { Profile, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createProfileRoutes from '@/modules/profile/profile.route';
import { IProfileService } from '@/types';
import { generateToken } from '@/utils/generate-token';

const FAKE_USER_ID = 'cmnup6jyf0000p0utn33xhdpq';
const FAKE_PROFILE_ID = 'id';

function createFakeUser(overrides = {}): {user: User, userJSON: any} {
  const user: User = {
    id: 'cmnup6jyf0000p0utn33xhdpq',
    email: 'pseudo@gmail.com',
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

const authHeader = () => 'Bearer ' + token;

class MockProfileService implements IProfileService {
  verifyPassword = jest.fn<Promise<boolean>, [string, string]>();
  getSingleProfile = jest.fn<Promise<Profile | null>, [string]>();
  getSingleUser = jest.fn<Promise<User | null>, [string]>();
  getCorrectParentalCode = jest.fn<Promise<number | undefined>, []>();
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

let token: string;
let mockService!: MockProfileService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(createFakeUser().user) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  app = express();
  mockService = new MockProfileService();
  app.use(express.json());
  app.use('/api/profile', createProfileRoutes(mockService));
});

describe('Profile Handling', () => {
  describe('GET /profile', () => {
    it('should get the profile of the authenticated user', async () => {
      const { profile, profileJSON } = createFakeProfile();
      mockService.getSingleProfile.mockResolvedValue(profile);

      const res = await request(app)
        .get('/api/profile/')
        .set('Authorization', authHeader());

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.body.data.profile).toEqual(profileJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the profile is not found', async () => {
      mockService.getSingleProfile.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/profile/')
        .set('Authorization', authHeader());

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /profile/user', () => {
    it('should get the user data of the authenticated user', async () => {
      const { user, userJSON } = createFakeUser();
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.getCorrectParentalCode.mockResolvedValue(1234);

      const res = await request(app)
        .get('/api/profile/user')
        .set('Authorization', authHeader())
        .set('X-Parental-Code', '1234');

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toEqual(userJSON);
      expect(res.status).toBe(200);
    });

    it('should return null if the parental code is invalid and the user is an intern', async () => {
      const {user} = createFakeUser({ role: 'INTERN' });
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.getCorrectParentalCode.mockResolvedValue(1234);

      const res = await request(app)
        .get('/api/profile/user')
        .set('Authorization', authHeader())
        .set('X-Parental-Code', '1111');

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toBeNull();
      expect(res.status).toBe(200);
    });

    it('should return the user if the parental code is invalid but the user is not an intern', async () => {
      const {user, userJSON} = createFakeUser({ role: 'EMPLOYEE' });
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.getCorrectParentalCode.mockResolvedValue(1234);

      const res = await request(app)
        .get('/api/profile/user')
        .set('Authorization', authHeader())
        .set('X-Parental-Code', '1111');

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toEqual(userJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the user is not found', async () => {
      app.use('/api/profile', createProfileRoutes(mockService));
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/profile/user')
        .set('Authorization', authHeader())
        .set('X-Parental-Code', '1234');

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /profile/setting', () => {
    it('should update the profile and user data of the authenticated user', async () => {
      const {user: newUser, userJSON: newUserJSON} = createFakeUser({ first_name: 'NewFirstName' });
      const {profile: newProfile, profileJSON: newProfileJSON} = createFakeProfile({ pseudo: 'NewPseudo' });
      mockService.getSingleUser.mockResolvedValue(newUser);
      mockService.updateProfile.mockResolvedValue({ user: newUser, profile: newProfile});

      const res = await request(app)
        .patch('/api/profile/setting')
        .set('Authorization', authHeader())
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
      const {user: newUser} = createFakeUser({ first_name: 'NewFirstName' });
      const {profile: newProfile} = createFakeProfile({ pseudo: 'NewPseudo' });
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/profile/setting')
        .set('Authorization', authHeader())
        .send({
          user: newUser,
          profile: newProfile,
        });

      expect(res.status).toBe(404);
    });

    it('should return 400 if the data provided is invalid', async () => {
      const {user} = createFakeUser();
      const {profile} = createFakeProfile();

      const res = await request(app)
        .patch('/api/profile/setting')
        .set('Authorization', authHeader())
        .send({
          user: { ...user, email: 'e' },
          profile,
        });

      expect(res.status).toBe(400);
    });
  });
  
  describe('GET /profile/:userId', () => {
    it('should get the profile of the user with the given id', async () => {
      const { profile, profileJSON } = createFakeProfile();
      mockService.getSingleProfile.mockResolvedValue(profile);

      const res = await request(app)
        .get(`/api/profile/${profile.userId}`)
        .set('Authorization', authHeader());

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(profile.userId);
      expect(res.body.data.profile).toEqual(profileJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if the profile is not found', async () => {
      mockService.getSingleProfile.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/profile/${FAKE_USER_ID}`)
        .set('Authorization', authHeader());

      expect(mockService.getSingleProfile).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /profile/follow", () => {
    it("should follow a user", async () => {
      const {user: followedUser} = createFakeUser({id: "followedUserId"});
      mockService.getSingleUser.mockResolvedValue(followedUser);
      mockService.followUser.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/profile/follow')
        .set('Authorization', authHeader())
        .send({ followedUserId: followedUser.id });

      expect(mockService.followUser).toHaveBeenCalledWith(FAKE_USER_ID, followedUser.id);
      expect(res.body.data).toBe(true);
      expect(res.status).toBe(200);
    });

    it("should not allow a user to follow themselves", async () => {
      const res = await request(app)
        .post('/api/profile/follow')
        .set('Authorization', authHeader())
        .send({ followedUserId: FAKE_USER_ID });

      expect(mockService.followUser).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

     it("should return 404 if the user to follow is not found", async () => {
      const followedUserId = "nonExistentUserId";
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/profile/follow')
        .set('Authorization', authHeader())
        .send({ followedUserId });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(followedUserId);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /profile/:userId/followers", () => {
    it("should get the followers of the authenticated user", async () => {
      const {profile} = createFakeProfile();
      const followers = [
        { pseudo: "Follower1", avatar: null },
        { pseudo: "Follower2", avatar: null },
      ];
      mockService.getSingleProfile.mockResolvedValue(profile);
      mockService.getFollowers.mockResolvedValue(followers);

      const res = await request(app)
        .get(`/api/profile/${profile.userId}/followers`)
        .set('Authorization', authHeader());

      expect(mockService.getFollowers).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data.followers).toEqual(followers);
      expect(res.status).toBe(200);
    });

    it("should return 404 if user is not found", async () => {
      mockService.getSingleProfile.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/profile/${FAKE_USER_ID}/followers`)
        .set('Authorization', authHeader());

      expect(mockService.getFollowers).not.toHaveBeenCalledWith();
      expect(res.status).toBe(404);
    });
  });

  describe("GET /profile/:userId/following", () => {
    it("should get the following of the user", async () => {
      const {profile} = createFakeProfile();
      const following = [
        { pseudo: "Following1", avatar: null },
        { pseudo: "Following2", avatar: null },
      ];
      mockService.getSingleProfile.mockResolvedValue(profile);
      mockService.getFollowing.mockResolvedValue(following);

      const res = await request(app)
        .get(`/api/profile/${profile.userId}/following`)
        .set('Authorization', authHeader());

      expect(mockService.getFollowing).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(res.body.data.following).toEqual(following);
      expect(res.status).toBe(200);
    });

    it("should return 404 if user is not found", async () => {
      mockService.getSingleProfile.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/profile/${FAKE_USER_ID}/following`)
        .set('Authorization', authHeader());

      expect(mockService.getFollowing).not.toHaveBeenCalledWith();
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /profile", () => {
    it("should delete the authenticated user's account and profile", async () => {
      const {user, userJSON} = createFakeUser();
      const {profile, profileJSON} = createFakeProfile();
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.deleteUser.mockResolvedValue({ user, profile });

      const res = await request(app)
        .delete('/api/profile/delete')
        .set('Authorization', authHeader());
        
      expect(mockService.deleteUser).toHaveBeenCalledWith(user.id);
      expect(res.body.data.user).toEqual(userJSON);
      expect(res.body.data.profile).toEqual(profileJSON);
      expect(res.status).toBe(200);
    });

    it("should return 404 if the user to delete is not found", async () => {
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/profile/delete')
        .set('Authorization', authHeader());

      expect(mockService.deleteUser).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });
});
