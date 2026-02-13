import { Router, type Router as ExpressRouter } from 'express';
// import authenticate from '../middlewares/authenticate';
import { profile, setProfile } from './profile.controller';

const profileRoutes: ExpressRouter = Router();

profileRoutes.get('/', profile);
profileRoutes.get('/setting', setProfile)
export default profileRoutes;
;

