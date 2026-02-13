import type { Request } from 'express';

import { Role } from '../config/client.config';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export interface requestBodyProfile {
    pseudo: string;
    avatar: string;
    bio: string;
  }
