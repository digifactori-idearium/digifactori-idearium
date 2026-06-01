import { Profile, Role, User } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import createUserRoutes from '@/modules/user/user.route';
import { IUserService } from '@/types';
import { generateToken } from '@/utils/generate-token';

const FAKE_USER_ID = 'fake-user-id';
const FAKE_TARGET_ID = 'fake-target-id';

function createFakeUser(overrides = {}): { user: User; userJSON: any } {
  const user: User = {
    id: FAKE_USER_ID,
    email: 'admin@gmail.com',
    first_name: 'FirstName',
    last_name: 'LastName',
    password: '$2b$10$aczlvziUehGE4/qEWocFuO6cKjOPZK78O/fFy4YnfmY.jtcNnvz0m',
    isActive: true,
    role: Role.ADMIN,
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

function createFakeTargetUser(overrides = {}): { user: User; userJSON: any } {
  return createFakeUser({
    id: FAKE_TARGET_ID,
    email: 'target@gmail.com',
    role: Role.INTERN,
    ...overrides,
  });
}

function createFakeProfile(overrides = {}): {
  profile: Profile;
  profileJSON: any;
} {
  const profile = {
    id: 'fake-profile-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: FAKE_USER_ID,
    pseudo: 'fakePseudo',
    avatar: null,
    bio: null,
    voiceButtons: true,
    ...overrides,
  };
  const profileJSON = {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
  return { profile, profileJSON };
}

class MockUserService implements IUserService {
  getUsers = jest.fn<Promise<User[]>, [Role]>();
  getUserById = jest.fn<Promise<User | null>, [string, Role]>();
  createUser = jest.fn<
    Promise<{ user: User; temporaryPassword: string }>,
    [any]
  >();
  updateUser = jest.fn<Promise<User>, [string, any]>();
  updateRole = jest.fn<Promise<User>, [string, Role]>();
  setActive = jest.fn<Promise<User>, [string, boolean]>();
  deleteUser = jest.fn<Promise<{ user: User }>, [string]>();
}

let mockService!: MockUserService;
let app!: express.Express;
let adminToken: string;
let supervisorToken: string;

beforeAll(() => {
  const { user: adminUser } = createFakeUser({ role: Role.ADMIN });
  const { user: supervisorUser } = createFakeUser({
    id: 'supervisor-id',
    role: Role.SUPERVISOR,
  });
  const { profile } = createFakeProfile();
  adminToken = generateToken(adminUser, profile) as string;
  supervisorToken = generateToken(supervisorUser, profile) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockUserService();
  app = express();
  app.use(express.json());
  app.use('/api/user', createUserRoutes(mockService));
});

describe('User handling', () => {
  describe('GET /user/', () => {
    it('should return all users for ADMIN', async () => {
      const { user } = createFakeUser();
      mockService.getUsers.mockResolvedValue([user]);

      const res = await request(app)
        .get('/api/user/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(mockService.getUsers).toHaveBeenCalledWith(Role.ADMIN);
      expect(res.status).toBe(200);
    });

    it('should return INTERN users for SUPERVISOR', async () => {
      const { user } = createFakeTargetUser();
      mockService.getUsers.mockResolvedValue([user]);

      const res = await request(app)
        .get('/api/user/')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(mockService.getUsers).toHaveBeenCalledWith(Role.SUPERVISOR);
      expect(res.status).toBe(200);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/user/');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /user/:id', () => {
    it('should return a user if found', async () => {
      const { user, userJSON } = createFakeTargetUser();
      mockService.getUserById.mockResolvedValue(user);

      const res = await request(app)
        .get(`/api/user/${FAKE_TARGET_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(mockService.getUserById).toHaveBeenCalledWith(
        FAKE_TARGET_ID,
        Role.ADMIN
      );
      expect(res.body.data).toEqual(userJSON);
      expect(res.status).toBe(200);
    });

    it('should return 404 if user is not found', async () => {
      mockService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/user/${FAKE_TARGET_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /user', () => {
    const validPayload = {
      email: 'new@gmail.com',
      first_name: 'John',
      last_name: 'Doe',
      pseudo: 'johndoe',
      role: Role.INTERN,
    };

    it('should create a user as ADMIN', async () => {
      const { user } = createFakeTargetUser();
      mockService.createUser.mockResolvedValue({
        user,
        temporaryPassword: 'tmp',
      });

      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload);

      expect(mockService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@gmail.com', role: Role.INTERN })
      );
      expect(res.status).toBe(201);
    });

    it('should return 403 if SUPERVISOR tries to create a SUPERVISOR', async () => {
      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ ...validPayload, role: Role.SUPERVISOR });

      expect(mockService.createUser).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });

    it('should return 403 if ADMIN tries to create an ADMIN', async () => {
      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validPayload, role: Role.ADMIN });

      expect(mockService.createUser).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });

    it('should return 400 if payload is invalid', async () => {
      const res = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'not-an-email' });

      expect(mockService.createUser).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /user/:id/role', () => {
    it('should update the role as ADMIN', async () => {
      const { user } = createFakeTargetUser({ role: Role.SUPERVISOR });
      mockService.getUserById.mockResolvedValue(createFakeTargetUser().user);
      mockService.updateRole.mockResolvedValue(user);

      const res = await request(app)
        .patch(`/api/user/${user.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.SUPERVISOR });

      expect(mockService.updateRole).toHaveBeenCalledWith(
        user.id,
        Role.SUPERVISOR
      );
      expect(res.status).toBe(200);
    });

    it('should return 403 if SUPERVISOR tries to assign SUPERVISOR role', async () => {
      const res = await request(app)
        .patch(`/api/user/${FAKE_TARGET_ID}/role`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ role: Role.SUPERVISOR });

      expect(mockService.updateRole).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });

    it('should return 404 if target user is not found', async () => {
      mockService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/user/${FAKE_TARGET_ID}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.INTERN });

      expect(mockService.updateRole).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });

    it('should return 403 if ADMIN tries to change another ADMIN role', async () => {
      const { user: anotherAdmin } = createFakeUser({
        id: FAKE_TARGET_ID,
        role: Role.ADMIN,
      });
      mockService.getUserById.mockResolvedValue(anotherAdmin);

      const res = await request(app)
        .patch(`/api/user/${FAKE_TARGET_ID}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.INTERN });

      expect(mockService.updateRole).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /user/:id/active', () => {
    it('should activate a user as ADMIN', async () => {
      const { user } = createFakeTargetUser({ isActive: true });
      mockService.getUserById.mockResolvedValue(user);
      mockService.setActive.mockResolvedValue(user);

      const res = await request(app)
        .patch(`/api/user/${user.id}/active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(mockService.setActive).toHaveBeenCalledWith(user.id, true);
      expect(res.status).toBe(200);
    });

    it('should return 403 if SUPERVISOR tries to activate a user', async () => {
      const res = await request(app)
        .patch(`/api/user/${FAKE_TARGET_ID}/active`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ isActive: true });

      expect(mockService.setActive).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });

    it('should return 403 if ADMIN tries to deactivate themselves', async () => {
      const res = await request(app)
        .patch(`/api/user/${FAKE_USER_ID}/active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(mockService.setActive).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });

    it('should return 400 if isActive is not a boolean', async () => {
      const res = await request(app)
        .patch(`/api/user/${FAKE_TARGET_ID}/active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: 'yes' });

      expect(mockService.setActive).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 404 if the target user is not found', async () => {
      mockService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/user/${FAKE_TARGET_ID}/active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(mockService.setActive).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /user/:id', () => {
    it('should delete a user as ADMIN', async () => {
      const { user } = createFakeTargetUser();
      mockService.getUserById.mockResolvedValue(user);
      mockService.deleteUser.mockResolvedValue({ user });

      const res = await request(app)
        .delete(`/api/user/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(mockService.deleteUser).toHaveBeenCalledWith(user.id);
      expect(res.status).toBe(200);
    });

    it('should return 404 if user is not found', async () => {
      mockService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/user/${FAKE_TARGET_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(mockService.deleteUser).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });

    it('should return 403 if ADMIN tries to delete another ADMIN', async () => {
      const { user: anotherAdmin } = createFakeUser({
        id: FAKE_TARGET_ID,
        role: Role.ADMIN,
      });
      mockService.getUserById.mockResolvedValue(anotherAdmin);

      const res = await request(app)
        .delete(`/api/user/${FAKE_TARGET_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(mockService.deleteUser).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });
  });
});
