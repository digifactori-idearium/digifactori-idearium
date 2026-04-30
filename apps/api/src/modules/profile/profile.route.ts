import { Router, type Router as ExpressRouter } from 'express';

import ProfileController from './profile.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';
import { IProfileService } from '@/types';

export default function createProfileRoutes(profileService: IProfileService) {
  const profileController = new ProfileController(profileService);
  const profileRoutes: ExpressRouter = Router();

  profileRoutes.use(authenticate, requireAuth);

  profileRoutes.get('/', profileController.getMyProfile);
  profileRoutes.get('/user', profileController.getUser);
  profileRoutes.patch('/setting', profileController.setProfile);
  profileRoutes.get('/:userId', profileController.getProfile);
  profileRoutes.post('/follow', profileController.followUser);
  profileRoutes.get('/:userId/followers', profileController.getFollowers);
  profileRoutes.get('/:userId/following', profileController.getFollowing);
  profileRoutes.delete('/delete', profileController.deleteProfile);

  return profileRoutes;
}
