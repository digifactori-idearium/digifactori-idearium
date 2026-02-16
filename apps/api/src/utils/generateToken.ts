import jwt from 'jsonwebtoken';

import config from '../config/app.config';
import { type User } from '../config/client.config';

/**
 * Generates a JWT token for a user.
 * Returns the token string or null if generation fails.
 */
export const generateToken = (user: User): string | null => {
  try {
    if (!config.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the configuration.');
    }

    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: '4h',
      }
    );
  } catch (error) {
    console.error('Token Generation Error:', error);
    return null;
  }
};
