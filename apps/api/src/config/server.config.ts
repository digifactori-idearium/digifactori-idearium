import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const serverConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3001'),

  // Rate limiting
  MAX_CONCURRENT_USERS: z.coerce.number().int().positive().default(50),

  // Per-user
  AUTH_ATTEMPTS_PER_USER: z.coerce.number().int().positive().default(10), // per 15 min
  AUTOSAVES_PER_USER: z.coerce.number().int().positive().default(60), // per min
  DEFAULT_REQUESTS_PER_USER: z.coerce.number().int().positive().default(20), // per min
});

const serverConfig = serverConfigSchema.parse(process.env);

const u = serverConfig.MAX_CONCURRENT_USERS;

export default {
  ...serverConfig,
  IS_DEV: serverConfig.NODE_ENV !== 'production',
  limits: {
    auth: u * serverConfig.AUTH_ATTEMPTS_PER_USER,
    autoSave: u * serverConfig.AUTOSAVES_PER_USER,
    default: u * serverConfig.DEFAULT_REQUESTS_PER_USER,
  },
} as const;
