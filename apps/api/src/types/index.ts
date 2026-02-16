import type { Request } from 'express';

import { Role } from '../config/client.config';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export interface RequestBodyProfile {
  pseudo?: string;
  avatar?: string;
  bio?: string;
}
