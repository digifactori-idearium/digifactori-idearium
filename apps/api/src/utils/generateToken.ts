import jwt from 'jsonwebtoken';

import config from '../config/app.config';
import { type User } from '../config/client.config';

export const generateToken = (user: User): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    {
      expiresIn: '4h',
    }
  );
};
