import { Router, type Router as ExpressRouter } from 'express';

import AuthController from './auth.controller';

import { IAuthService } from '@/types';

export default function createAuthRoutes(authService: IAuthService) {
  const authController = new AuthController(authService);

  const authRoutes: ExpressRouter = Router();
  authRoutes.post('/register', authController.register);
  authRoutes.post('/login', authController.login);

  return authRoutes;
}
