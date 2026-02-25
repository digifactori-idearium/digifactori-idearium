import { Router, type Router as ExpressRouter } from 'express';

import authenticate from '../../middlewares/authenticate';

import { deleteProfile, getProfile, setProfile } from './profile.controller';

const profileRoutes: ExpressRouter = Router();

profileRoutes.post('/', authenticate, getProfile);
profileRoutes.post('/setting', authenticate, setProfile);
profileRoutes.delete('/delete', authenticate, deleteProfile);

export default profileRoutes;
