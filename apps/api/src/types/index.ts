import { Role } from '@/config/client.config';

export interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RequestBodyProfile {
  pseudo?: string;
  avatar?: string;
  bio?: string;
}
