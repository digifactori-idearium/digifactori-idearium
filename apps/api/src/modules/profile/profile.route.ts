import { Router, type Router as ExpressRouter } from 'express';
import authenticate from '../../middlewares/authenticate';
import { profile, setProfile } from './profile.controller';

const profileRoutes: ExpressRouter = Router();

profileRoutes.get('/:code', authenticate, profile);
profileRoutes.post('/setting', authenticate, setProfile)

export default profileRoutes;
