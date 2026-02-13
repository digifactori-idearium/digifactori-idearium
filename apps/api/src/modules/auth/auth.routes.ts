import { Router, type Router as ExpressRouter } from 'express';

import { register, login } from './auth.controller';

const authRoutes: ExpressRouter = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);

export default authRoutes;
