import { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '@/config/app.config';
import { UserPayload } from '@/types';
import HttpResponse from '@/utils/http-response';

/**
 * Middleware to check the token is provided
 * provide the request user
 *
 * @example
 * router.get('/profile', authenticate, controller);
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return HttpResponse.unAuthorized('Aucun token fourni').send(res);
  }

  const token = authHeader.split(' ')[1] || req.body?.token;
  if (!token) {
    return HttpResponse.unAuthorized('Aucun token fourni').send(res);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as UserPayload;
    req.user = decoded;
    return next();
  } catch (error: any) {
    return HttpResponse.unAuthorized(`Token non valide:${error}`).send(res);
  }
};

/**
 * Middleware to ensure user is authenticated
 *
 * @example
 * router.get('/profile', requireAuth, controller);
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    HttpResponse.unAuthorized("Vous n'avez pas les droits d'accès").send(res);
    return;
  }

  next();
};

/**
 * Middleware factory that restricts a route to users with one of the allowed roles.
 * Must be placed after the `authenticate` middleware so that `req.user` is populated.
 *
 * @example
 * router.get('/admin-only', requireRole('ADMIN'), handler);
 * router.get('/shared',     requireRole('ADMIN', 'SUPERVISOR'), handler);
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      HttpResponse.unAuthorized('Non authentifié').send(res);
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      HttpResponse.forbidden('Accès refusé').send(res);
      return;
    }

    next();
  };
};

/**
 * Middleware to ensure the ressourse belong to the user
 *
 * @example
 * router.delete('/users/ideoramas/:id/edit', requireResourceOwnership, controller);
 */
export const requireResourceOwnership =
  (getOwnerId: (req: Request) => string | number) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      HttpResponse.unAuthorized("Vous n'avez pas les droits d'accès").send(res);
      return;
    }

    const resourceOwnerId = getOwnerId(req);

    if (String(req.user.userId) !== String(resourceOwnerId)) {
      HttpResponse.forbidden(
        "Vous n'êtes pas autorisé à accéder à cette ressource."
      ).send(res);
      return;
    }

    next();
  };
