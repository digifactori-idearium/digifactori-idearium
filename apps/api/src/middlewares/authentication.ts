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
 * Middleware to ensure user has a specific role
 * Can be extended for role-based access control
 *
 * @example
 * router.delete('/users/:id', requireRole('ADMIN'), controller);
 */
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      HttpResponse.unAuthorized("Vous n'avez pas les droits d'accès").send(res);
      return;
    }

    if (req.user.role !== requiredRole) {
      HttpResponse.forbidden(
        `Cette action nécessite le rôle ${requiredRole}`
      ).send(res);
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
