import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type User, Profile, Role } from '@prisma/client';
import { Pool } from 'pg';

import 'dotenv/config';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the adapter
const adapter = new PrismaPg(pool);

class Database {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        adapter: adapter,
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
      });
    }
    return Database.instance;
  }

  static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      await pool.end();
    }
  }
}

export const prisma = Database.getInstance();
export type { User, Profile, Role };
export default Database;
