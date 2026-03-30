import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.route';
import ideoramasRoutes from './modules/ideorama/ideorama.route';
import profileRoutes from './modules/profile/profile.route';
import voxelRoutes from './modules/voxel/voxel.route';

// Env variables
dotenv.config();

const app = express();
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
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ideorama', ideoramasRoutes);
app.use('/api/voxel', voxelRoutes);

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
