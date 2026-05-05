import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express } from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import createStorageRoutes from './modules/storage/storage.route';

import createAssetRoutes from '@/modules/asset/asset.route';
import AssetService from '@/modules/asset/asset.service';
import createAuthRoutes from '@/modules/auth/auth.route';
import AuthService from '@/modules/auth/auth.service';
import createEditorRoutes from '@/modules/editor/editor.route';
import EditorService from '@/modules/editor/editor.service';
import createIdeoramaRoutes from '@/modules/ideorama/ideorama.route';
import IdeoramaService from '@/modules/ideorama/ideorama.services';
import createIdeaRoutes from './modules/idea/idea.route';
import IdeaService from './modules/idea/idea.service';
import IdeoramaService from '@/modules/ideorama/ideorama.service';
import createProfileRoutes from '@/modules/profile/profile.route';
import ProfileService from '@/modules/profile/profile.service';
import createSettingsRoutes from '@/modules/setting/settings.route';
import SettingsService from '@/modules/setting/settings.service';
import createUserRoutes from '@/modules/user/user.route';
import UserService from '@/modules/user/user.service';
import createVoxelRoutes from '@/modules/voxel/voxel.route';
import VoxelService from '@/modules/voxel/voxel.service';

// Env variables
dotenv.config();

const app: Express = express();
export default app;
const PORT = process.env.PORT || 3001;

// set up rate limiter: maximum of five requests per minute
const limiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max 60 requests per windowMs
});

const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(LOCAL_UPLOADS_DIR));
}
// Routes

app.use('/api/storage', createStorageRoutes());

const authService = new AuthService();
app.use('/api/auth', createAuthRoutes(authService));

const userService = new UserService();
app.use('/api/user', createUserRoutes(userService));

const profileService = new ProfileService();
app.use('/api/profile', createProfileRoutes(profileService));

const ideoramaService = new IdeoramaService();
app.use('/api/ideorama', createIdeoramaRoutes(ideoramaService));

const ideaService = new IdeaService();
app.use('/api/ideas', createIdeaRoutes(ideaService));

const voxelService = new VoxelService();
app.use('/api/voxel', createVoxelRoutes(voxelService));

const editorService = new EditorService();
app.use('/api/editor', createEditorRoutes(editorService));

const assetService = new AssetService();
app.use('/api/asset', createAssetRoutes(assetService));

const settingsService = new SettingsService();
app.use('/api/settings', createSettingsRoutes(settingsService));

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
