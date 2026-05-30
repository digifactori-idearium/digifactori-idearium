import path from 'path';

import cors from 'cors';
import express, { type Express } from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import createIdeaRoutes from './modules/idea/idea.route';
import IdeaService from './modules/idea/idea.service';

import serverConfig from '@/config/server.config';
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

const { PORT, IS_DEV, limits } = serverConfig;
const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Request Limiters
const authLimiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: limits.auth,
  message: { error: 'Too many auth attempts, try again later.' },
});

const autoSaveLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: limits.autoSave,
  message: { error: 'Editor rate limit exceeded.' },
});

const defaultLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: limits.default,
  message: { error: 'Too many requests, slow down.' },
  skip: req =>
    req.path.startsWith('/api/proxy') || req.path.startsWith('/api/editor'),
});

// App
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
app.use('/api/proxy', proxyRouter);
app.use('/api/storage', createStorageRoutes());

const authService = new AuthService();
app.use('/api/auth', authLimiter, createAuthRoutes(authService));

const userService = new UserService();
app.use('/api/user', createUserRoutes(userService));

const profileService = new ProfileService();
app.use('/api/profile', createProfileRoutes(profileService));

const ideoramaService = new IdeoramaService();
app.use(
  '/api/ideorama',
  autoSaveLimiter,
  createIdeoramaRoutes(ideoramaService)
);

const ideaService = new IdeaService();
app.use('/api/ideas', createIdeaRoutes(ideaService));

const voxelService = new VoxelService();
app.use('/api/voxel', autoSaveLimiter, createVoxelRoutes(voxelService));

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
    concurrentUsers: serverConfig.MAX_CONCURRENT_USERS,
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DigiFactori Idearium',
    version: '1.0.0',
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to DigiFactori Idearium API',
    version: '1.0.0',
  });
});

// Error handling
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

// 404
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start
app.listen(PORT, () => {
  if (IS_DEV) {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(
      `Limits configured for ${serverConfig.MAX_CONCURRENT_USERS} concurrent users`
    );
    console.log(
      `  Auth: ${limits.auth} req/15min | AutoSave: ${limits.autoSave} req/min | Default: ${limits.default} req/min`
    );
  }
});
