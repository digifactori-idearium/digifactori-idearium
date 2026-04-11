import { Router, type Router as ExpressRouter } from 'express';

import { deleteProfile, getProfile, setProfile } from './profile.controller';

import { authenticate, requireAuth } from '@/middlewares/authentication';

const profileRoutes: ExpressRouter = Router();

profileRoutes.post('/', authenticate, requireAuth, getProfile);
profileRoutes.post('/setting', authenticate, requireAuth, setProfile);
profileRoutes.delete('/delete', authenticate, requireAuth, deleteProfile);

export default profileRoutes;
