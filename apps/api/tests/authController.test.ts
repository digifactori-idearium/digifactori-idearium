import { Profile, User } from '@prisma/client';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { prisma } from '@/config/client.config';
import createAuthRoutes from '@/modules/auth/auth.route';
import { EmailService } from '@/modules/auth/email.service';
import { IAuthService } from '@/types';
import { generateToken } from '@/utils/generate-token';

const FAKE_USER_ID = 'fake-user-id';
const FAKE_EMAIL = 'pseudo@gmail.com';
const FAKE_PROFILE_ID = 'fake-profile-id';
const FAKE_PSEUDO = 'fakePseudo';

function createFakeUser(overrides = {}): { user: User; userJSON: any } {
  const user: User = {
    id: FAKE_USER_ID,
    email: 'pseudo@gmail.com',
    first_name: 'FirstName',
    last_name: 'LastName',
    password: '$2b$10$aczlvziUehGE4/qEWocFuO6cKjOPZK78O/fFy4YnfmY.jtcNnvz0m',
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

function createFakeProfile(overrides = {}): {
  profile: Profile;
  profileJSON: any;
} {
  const profile = {
    id: FAKE_PROFILE_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'fake-user-id',
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

const authHeader = () => 'Bearer ' + token;

class MockAuthService implements IAuthService {
  verifyPassword = jest.fn<Promise<boolean>, [string, string]>();
  getSingleUser = jest.fn<Promise<User | null>, [string]>();
  createUser = jest.fn<Promise<User>, [UserInput]>();
  createProfile = jest.fn<Promise<Profile>, [ProfileInput, string]>();
  createAccount = jest.fn<
    Promise<{ profile: Profile; user: User }>,
    [RegisterInput]
  >();
  loginEmail = jest.fn<
    Promise<{ profile: Profile; user: User } | null>,
    [string, string]
  >();
  loginPseudo = jest.fn<
    Promise<{ profile: Profile; user: User } | null>,
    [string, string]
  >();
  changePassword = jest.fn<Promise<true>, [string, string]>();
  requestPasswordReset = jest.fn<Promise<void>, [string]>();
}

jest.mock('@/config/client.config', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    profile: {},
  },
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue(undefined),
    },
  })),
}));

let token: string;
let mockService!: MockAuthService;
let app!: express.Express;

beforeAll(async () => {
  token = generateToken(
    createFakeUser().user,
    createFakeProfile().profile
  ) as string;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockService = new MockAuthService();
  app = express();
  app.use(express.json());
  app.use('/api/auth', createAuthRoutes(mockService));
});

describe('User authentication handling', () => {
  describe('POST /auth/register', () => {
    it('should register the user', async () => {
      const { user, userJSON } = createFakeUser();
      const { profile } = createFakeProfile();

      mockService.createAccount.mockResolvedValue({ user, profile });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ user, profile: { pseudo: FAKE_PSEUDO } });

      const decoded = jwt.decode(res.body.data.accessToken) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(res.body.data.user).toEqual(userJSON);
      expect(mockService.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: user.email }),
          profile: expect.objectContaining({ pseudo: FAKE_PSEUDO }),
        })
      );
      expect(res.status).toBe(201);
    });

    it('should fail if the data is incorrect', async () => {
      const { user } = createFakeUser({ email: 'e' });
      const { profile } = createFakeProfile();

      mockService.createAccount.mockResolvedValue({ user, profile });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ user, profile: { pseudo: FAKE_PSEUDO } });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should success to login with pseudo', async () => {
      const { user } = createFakeUser();
      const { profile } = createFakeProfile();
      mockService.loginPseudo.mockResolvedValue({ user, profile });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ pseudo: FAKE_PSEUDO, password: '111111aA!' });

      const decoded = jwt.decode(res.body.data.accessToken) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(mockService.loginPseudo).toHaveBeenCalledWith(
        FAKE_PSEUDO,
        '111111aA!'
      );
      expect(res.status).toBe(200);
    });

    it('should success to login with email', async () => {
      const { user } = createFakeUser();
      const { profile } = createFakeProfile();
      mockService.loginEmail.mockResolvedValue({ user, profile });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: '111111aA!' });

      const decoded = jwt.decode(res.body.data.accessToken) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(mockService.loginEmail).toHaveBeenCalledWith(
        user.email,
        '111111aA!'
      );
      expect(res.status).toBe(200);
    });

    it('should fail to login if data format is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ pseudo: 'e', password: '111111aA!' });

      expect(mockService.loginPseudo).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should fail to login if password is incorrect', async () => {
      mockService.loginPseudo.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ pseudo: FAKE_PSEUDO, password: '211111aA!' });

      expect(mockService.loginPseudo).toHaveBeenCalledWith(
        FAKE_PSEUDO,
        '211111aA!'
      );
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /auth/change-password', () => {
    it('should change the password', async () => {
      const { user } = createFakeUser();
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.verifyPassword.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', authHeader())
        .send({
          currentPassword: '111111aA!',
          newPassword: '222222aA!',
          confirmPassword: '222222aA!',
        });

      expect(mockService.changePassword).toHaveBeenCalledWith(
        FAKE_USER_ID,
        '222222aA!'
      );
      expect(res.body.data).toBeUndefined();
      expect(res.status).toBe(200);
    });

    it('should fail if the new password and the confirm password are different', async () => {
      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', authHeader())
        .send({
          currentPassword: '111111aA!',
          newPassword: '222222aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should fail if the new password format is incorrect', async () => {
      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', authHeader())
        .send({
          currentPassword: '111111aA!',
          newPassword: '1',
          confirmPassword: '1',
        });

      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should fail if the user is not found', async () => {
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', authHeader())
        .send({
          currentPassword: '111111aA!',
          newPassword: '222222aA!',
          confirmPassword: '222222aA!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });

    it('should fail if the current password is incorrect', async () => {
      const { user } = createFakeUser();
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.verifyPassword.mockResolvedValue(false);

      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', authHeader())
        .send({
          currentPassword: '111111aA!',
          newPassword: '222222aA!',
          confirmPassword: '222222aA!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(user.id);
      expect(mockService.verifyPassword).toHaveBeenCalledWith(
        user.id,
        '111111aA!'
      );
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/reset-password/request', () => {
    it('should send an email if the user is found', async () => {
      const { user } = createFakeUser();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest
        .spyOn(EmailService, 'sendPasswordReset')
        .mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/auth/reset-password/request')
        .send({
          email: user.email,
        });

      expect(mockService.requestPasswordReset).toHaveBeenCalledWith(user.email);
      expect(res.status).toBe(200);
    });

    it('should not send an email if the user is not found, but still return 200', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/reset-password/request')
        .send({
          email: FAKE_EMAIL,
        });

      expect(EmailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /auth/reset-password', () => {
    it('should reset password', async () => {
      const { user } = createFakeUser({ isActive: true });
      mockService.getSingleUser.mockResolvedValue(user);
      mockService.changePassword.mockResolvedValue(true);
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET + user.password,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: resetToken })
        .send({
          newPassword: '333333aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.changePassword).toHaveBeenCalledWith(
        user.id,
        '333333aA!'
      );
      expect(res.status).toBe(200);
    });

    it('should return 400 if the token is missing', async () => {
      const { user } = createFakeUser({ isActive: true });
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .set('Authorization', authHeader())
        .send({
          newPassword: '333333aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.getSingleUser).not.toHaveBeenCalled();
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 400 if the token is invalid', async () => {
      console.log('token invalid test');
      const { user } = createFakeUser({ isActive: true });
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: authHeader() })
        .send({
          newPassword: '333333aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.getSingleUser).not.toHaveBeenCalled();
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 404 if the user is not found', async () => {
      const { user } = createFakeUser();
      const { profile } = createFakeProfile();
      mockService.getSingleUser.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: generateToken(user, profile) })
        .send({
          newPassword: '333333aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(404);
    });

    it('should return 400 if the user is not active', async () => {
      const { user } = createFakeUser({ isActive: false });
      const { profile } = createFakeProfile();
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: generateToken(user, profile) })
        .send({
          newPassword: '333333aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 400 if the token is not valid', async () => {
      const { user } = createFakeUser({ isActive: true });
      const { profile } = createFakeProfile();
      mockService.getSingleUser.mockResolvedValue(user);

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: generateToken(user, profile) })
        .send({
          newPassword: '333333aA!',
          confirmPassword: '333333aA!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 400 if the new password format is incorrect', async () => {
      const { user } = createFakeUser({ isActive: true });
      mockService.getSingleUser.mockResolvedValue(user);
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET + user.password,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: token })
        .send({
          newPassword: '3!',
          confirmPassword: '3!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('should return 400 if the new password and confirmPassword are different', async () => {
      const { user } = createFakeUser({ isActive: true });
      mockService.getSingleUser.mockResolvedValue(user);
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET + user.password,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .patch('/api/auth/reset-password')
        .query({ token: token })
        .send({
          newPassword: '333333aA!',
          confirmPassword: '33aA!',
        });

      expect(mockService.getSingleUser).toHaveBeenCalledWith(FAKE_USER_ID);
      expect(mockService.changePassword).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });
});
