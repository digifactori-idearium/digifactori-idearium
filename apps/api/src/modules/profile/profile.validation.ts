import { Role } from '@prisma/client';
import * as z from 'zod';

import { prisma } from '@/config/client.config';

/**
 * Checks if a user with the given email has a parental code set
 * Used to validate parental code requirements for child accounts
 * @param email - The user's email address to check
 * @returns Promise<boolean> true if user exists and has a parental code, false otherwise
 * @throws Logs error to console and returns false on any database errors
 */
const checkHasParentalCode = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        role: true,
        parental_code: true,
      },
    });

    if (!user) return false;

    return user.parental_code !== null;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * User profile update validation schema
 *
 * Validates user profile data during updates with the following constraints:
 * @property {string} email - User's email address (must be valid email format, cannot be empty)
 * @property {string} first_name - User's first name (minimum 2 characters)
 * @property {string} last_name - User's last name (minimum 2 characters)
 * @property {Role} role - User's role (must be one of: USER, ADMIN, INTERN, PARENT)
 * @property {string} [parental_code] - Optional parental code for child accounts
 *   - Can be empty string, undefined, or string with minimum 4 characters
 *   - Required if role is INTERN and no parental code exists in database
 *
 * Validation performs async checks to verify parental code requirements
 * Messages are in French (FR)
 */
export const userProfileSchema = z
  .object({
    email: z.email({
      error: iss => {
        return iss.input === undefined
          ? "L'adresse mail est requise"
          : 'Adresse mail invalide';
      },
    }),
    first_name: z
      .string('Le prénom est requis')
      .min(2, "Le prénom doit être composé d'au moins 2 caractères"),
    last_name: z
      .string('Le nom de fammile est requis')
      .min(2, 'Le nom de famille doit comporter au moins 2 caractères'),
    role: z.enum(Role, {
      error: iss => {
        return iss.input === undefined ? 'Le rôle est requis' : 'Rôle inconnu';
      },
    }),
    parental_code: z.string().optional().or(z.literal('')),
  })
  .superRefine(async (data, ctx) => {
    const isIntern = data.role === 'INTERN';

    const hasCodeInDb = await checkHasParentalCode(data.email);

    if (
      isIntern &&
      !hasCodeInDb &&
      (!data.parental_code || data.parental_code.length < 4)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Un code parental est requis pour les comptes enfants.',
        path: ['parental_code'],
      });
    }
  });

/**
 * User profile validation schema
 *
 * Validates user profile/username data with the following constraints:
 * @property {string} pseudo - User's profile username (minimum 2 characters)
 *   - Used as display name in the application
 *   - Must be unique across the system (checked at registration)
 *
 * Messages are in French (FR)
 */
export const profileSchema = z.object({
  pseudo: z
    .string('Le pseudo est requis')
    .min(2, 'Le pseudo doit comporter au moins 2 caractères.'),
});
