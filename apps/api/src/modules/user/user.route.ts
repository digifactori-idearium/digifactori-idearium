import { Router, type Router as ExpressRouter } from 'express';

import UserController from './user.controller';

import { authenticate, requireRole } from '@/middlewares/authentication';
import { IUserService } from '@/types';

export default function createUserRoutes(
  userService: IUserService
): ExpressRouter {
  const userController = new UserController(userService);

  const userRoutes: ExpressRouter = Router();

  // MIDDLEWARES
  userRoutes.use(authenticate);

  /**
   * GET /user/list
   * ADMIN      → all users
   * SUPERVISOR → all INTERN accounts
   */
  userRoutes.get(
    '/list',
    requireRole('ADMIN', 'SUPERVISOR'),
    userController.getUsers
  );

  /**
   * GET /user/:id
   * ADMIN      → any user
   * SUPERVISOR → any INTERN account
   */
  userRoutes.get(
    '/:id',
    requireRole('ADMIN', 'SUPERVISOR'),
    userController.getUserById
  );

  /**
   * POST /users
   * ADMIN      → create SUPERVISOR or INTERN
   * SUPERVISOR → create INTERN only
   */
  userRoutes.post(
    '/',
    requireRole('ADMIN', 'SUPERVISOR'),
    userController.createUser
  );

  /**
   * PATCH /user/:id
   * Update basic info (email, first_name, last_name)
   */
  userRoutes.patch(
    '/:id',
    requireRole('ADMIN', 'SUPERVISOR'),
    userController.updateUser
  );

  /**
   * PATCH /users/:id/role
   * ADMIN      → any role (cannot change another ADMIN)
   * SUPERVISOR → INTERN role only
   */
  userRoutes.patch(
    '/:id/role',
    requireRole('ADMIN', 'SUPERVISOR'),
    userController.updateRole
  );

  /**
   * PATCH /users/:id/active
   * Activate or deactivate a user — ADMIN
   */
  userRoutes.patch(
    '/:id/active',
    requireRole('ADMIN'),
    userController.setActive
  );

  /**
   * DELETE /users/:id
   * ADMIN      → any non-ADMIN user
   * SUPERVISOR → any INTERN account
   */
  userRoutes.delete(
    '/:id',
    requireRole('ADMIN', 'SUPERVISOR'),
    userController.deleteUser
  );

  return userRoutes;
}
