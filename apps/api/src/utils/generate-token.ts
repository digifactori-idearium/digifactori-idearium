import jwt from 'jsonwebtoken';

import config from '@/config/app.config';
import { type User, Profile } from '@/config/client.config';

/**
 * Generates a JWT token for a user.
 * @param {User} user - the user data
 * @param {Profile} profile - the profile data
 * @returns the token string or null if generation fails.
 */
export const generateToken = (user: User, profile: Profile): string => {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the configuration.');
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      voiceButtons: profile.voiceButtons,
    },
    config.JWT_SECRET,
    { expiresIn: '7h' }
  );
};
