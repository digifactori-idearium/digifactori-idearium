import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express } from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import createAssetRoutes from '@/modules/asset/asset.route';
import AssetService from '@/modules/asset/asset.service';
import createAuthRoutes from '@/modules/auth/auth.route';
import AuthService from '@/modules/auth/auth.service';
import createEditorRoutes from '@/modules/editor/editor.route';
import EditorService from '@/modules/editor/editor.service';
import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import IdeoramaService from '@/modules/ideorama/ideorama.service';
import createProfileRoutes from '@/modules/profile/profile.route';
import ProfileService from '@/modules/profile/profile.service';
import proxyRouter from '@/modules/proxy/proxy.route';
import createSettingsRoutes from '@/modules/setting/settings.route';
import SettingsService from '@/modules/setting/settings.service';
import createStorageRoutes from '@/modules/storage/storage.route';
import createUserRoutes from '@/modules/user/user.route';
import UserService from '@/modules/user/user.service';
import createVoxelRoutes from '@/modules/voxel/voxel.route';
import VoxelService from '@/modules/voxel/voxel.service';

// Env variables
dotenv.config();

// Constants
const PORT = process.env.PORT || 3001;
const IS_DEV = process.env.NODE_ENV !== 'production';
const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Request Limiters
const authLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many auth attempts, try again later.' },
});

const autoSaveLimiter = RateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 600, // ~10 autosaves/sec
  message: { error: 'Editor rate limit exceeded.' },
});

const defaultLimiter = RateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 200, // 200 req/min per IP for non-auth/autosave routes
  message: { error: 'Too many requests, slow down.' },
  skip: (
    req // proxy and editor have their own limiters
  ) => req.path.startsWith('/api/proxy') || req.path.startsWith('/api/editor'),
});

// app
const app: Express = express();
export default app;

// Middleware
app.use(defaultLimiter);
app.use(helmet());
app.use(cors());
app.use(morgan(IS_DEV ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

if (IS_DEV) {
  app.use('/uploads', express.static(LOCAL_UPLOADS_DIR));
}
// Routes
app.use('/api/auth', authLimiter, createAuthRoutes(new AuthService()));
app.use(
  '/api/editor',
  autoSaveLimiter,
  createEditorRoutes(new EditorService())
);
app.use('/api/proxy', proxyRouter);
app.use('/api/storage', createStorageRoutes());
app.use('/api/user', createUserRoutes(new UserService()));
app.use('/api/profile', createProfileRoutes(new ProfileService()));
app.use(
  '/api/ideorama',
  autoSaveLimiter,
  createIdeoramaRoutes(new IdeoramaService())
);
app.use('/api/voxel', autoSaveLimiter, createVoxelRoutes(new VoxelService()));
app.use('/api/asset', createAssetRoutes(new AssetService()));
app.use('/api/settings', createSettingsRoutes(new SettingsService()));

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

// Server start
app.listen(PORT, () => {
  if (IS_DEV) {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  }
});
