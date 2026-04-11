import { Request, Response, NextFunction } from 'express';

import HttpResponse from './http-response';

/**
 * Wrapper for async controller handlers to catch errors automatically
 * Eliminates try-catch boilerplate in every controller method
 *
 * @param handler - Async controller function
 * @returns Express middleware function
 *
 * @example
 * const controller = asyncHandler(async (req, res) => {
 *   const user = await userService.create(req.body);
 *   HttpResponse.created(user, 'User created').send(res);
 * });
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch((error: any) => {
      console.error('Async handler error:', error);

      if (!res.headersSent) {
        HttpResponse.serverError(
          error?.message || 'An unexpected error occurred'
        ).send(res);
      }
    });
  };
};

export default asyncHandler;
