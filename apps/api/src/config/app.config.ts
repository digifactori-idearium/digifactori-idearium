import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z
    .string()
    .default('postgresql://username:password@host:port/database?schema=public'),
  JWT_SECRET: z.string().min(32).default('MYSECRETTOKENKEY'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_URL: z.url().default('http://localhost:3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const config = configSchema.parse(process.env);

export default config;
