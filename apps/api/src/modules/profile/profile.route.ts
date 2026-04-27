import { Router, type Router as ExpressRouter } from 'express';

import ProfileController from './profile.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { IProfileService } from '@/types';

export default function createProfileRoutes(profileService: IProfileService) {
  const profileController = new ProfileController(profileService);

  const profileRoutes: ExpressRouter = Router();
  profileRoutes.post(
    '/',
    authenticate,
    requireAuth,
    profileController.getMyProfile
  );
  profileRoutes.post(
    '/setting',
    authenticate,
    requireAuth,
    profileController.setProfile
  );
  profileRoutes.post(
    '/find',
    authenticate,
    requireAuth,
    profileController.getProfile
  );
  profileRoutes.delete(
    '/delete',
    authenticate,
    requireAuth,
    profileController.deleteProfile
  );
  profileRoutes.get(
    '/public/:pseudo',
    profileController.getPublicProfile
  );

  return profileRoutes;
}
