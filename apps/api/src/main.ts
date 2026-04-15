import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express } from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import createAuthRoutes from './modules/auth/auth.route';
import AuthService from './modules/auth/auth.service';
import createIdeoramaRoutes from './modules/ideorama/ideorama.route';
import IdeoramaService from './modules/ideorama/ideorama.services';
import createProfileRoutes from './modules/profile/profile.route';
import ProfileService from './modules/profile/profile.service';
import createVoxelRoutes from './modules/voxel/voxel.route';
import VoxelService from './modules/voxel/voxel.service';

// Env variables
dotenv.config();

const app: Express = express();
export default app
const PORT = process.env.PORT || 3001;

// set up rate limiter: maximum of five requests per minute
const limiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max 60 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authService = new AuthService()
app.use('/api/auth', createAuthRoutes(authService));

const profileService = new ProfileService();
app.use('/api/profile', createProfileRoutes(profileService));

const ideoramaService = new IdeoramaService();
app.use('/api/ideorama', createIdeoramaRoutes(ideoramaService));

const voxelService = new VoxelService()
app.use('/api/voxel', createVoxelRoutes(voxelService));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DigiFactori API',
  });
});

// Basic route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to DigiFactori Idearium API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  }
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
