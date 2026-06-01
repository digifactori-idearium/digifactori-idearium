import { Router, type Router as ExpressRouter } from 'express';

import AuthController from './auth.controller';

import { authenticate } from '@/middlewares/authentication';
import { IAuthService } from '@/types';

export default function createAuthRoutes(authService: IAuthService) {
  const authController = new AuthController(authService);

  const authRoutes: ExpressRouter = Router();
  authRoutes.post('/register', authController.register);
  authRoutes.post('/login', authController.login);
  authRoutes.patch(
    '/change-password',
    authenticate,
    authController.changePassword
  );
  authRoutes.post(
    '/reset-password/request',
    authController.requestPasswordReset
  );
  authRoutes.patch('/reset-password', authController.resetPassword);

  return authRoutes;
}
