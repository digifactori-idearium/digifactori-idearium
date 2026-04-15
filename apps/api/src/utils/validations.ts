import * as z from 'zod';

import { prisma, type User, Role } from '../config/client.config';

/**
 * Regex pattern for password validation
 * Requirements: at least 1 lowercase letter, 1 uppercase letter, and 1 digit
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;

/**
 * Retrieves a user from the database by email address
 * @param email - The user's email address to search for
 * @returns Promise<User | null> The user object if found, null otherwise
 * @throws Catches and returns null on any database errors
 */
const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const userwithemail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return userwithemail;
  } catch {
    return null;
  }
};

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
 * User registration validation schema
 *
 * Validates user account creation data with the following constraints:
 * @property {string} email - User's email address (must be valid email format)
 * @property {string} first_name - User's first name (minimum 2 characters)
 * @property {string} last_name - User's last name (minimum 2 characters)
 * @property {Role} role - User's role (must be one of: USER, ADMIN, CHILD, PARENT)
 * @property {string} password - User's password
 *   - Minimum 6 characters
 *   - Must contain at least 1 lowercase letter (a-z)
 *   - Must contain at least 1 uppercase letter (A-Z)
 *   - Must contain at least 1 digit (0-9)
 * @property {number} [parental_code] - Optional parental code for child accounts
 *   - Required if role is CHILD
 *   - Must be minimum 4 digits if provided
 *
 * Messages are in French (FR)
 */
export const userSchema = z
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
    password: z
      .string('Le mot de passe est requis')
      .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
      .regex(
        passwordRegex,
        'Il faut au moins 1 majuscule, 1 minuscule et 1 chiffre.'
      ),
    parental_code: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.role === Role.CHILD &&
      (!data.parental_code || data.parental_code.toString().length < 4)
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Un code parental est requis pour les comptes enfants (minimum 4 chiffres).',
        path: ['parental_code'],
      });
    }
  });

/**
 * User profile update validation schema
 *
 * Validates user profile data during updates with the following constraints:
 * @property {string} email - User's email address (must be valid email format, cannot be empty)
 * @property {string} first_name - User's first name (minimum 2 characters)
 * @property {string} last_name - User's last name (minimum 2 characters)
 * @property {Role} role - User's role (must be one of: USER, ADMIN, CHILD, PARENT)
 * @property {string} [parental_code] - Optional parental code for child accounts
 *   - Can be empty string, undefined, or string with minimum 4 characters
 *   - Required if role is CHILD and no parental code exists in database
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
    const isChildInForm = data.role === 'CHILD';

    const hasCodeInDb = await checkHasParentalCode(data.email);

    if (
      isChildInForm &&
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

/**
 * User registration validation schema (composite)
 *
 * Validates complete registration data combining user account and profile information
 * @property {Object} user - User account data (must pass userSchema validation)
 * @property {Object} profile - User profile data (must pass profileSchema validation)
 *
 * Additional validation checks:
 * - Email must not already exist in the database
 *
 * Messages are in French (FR)
 */
export const registrationSchema = z
  .object({
    user: userSchema,
    profile: profileSchema,
  })
  .superRefine(async (data, ctx) => {
    const exists = await getUserByEmail(data.user.email);

    if (exists) {
      ctx.addIssue({
        path: ['user', 'email'],
        code: 'custom',
        message: "L'email existe déjà",
      });
    }
  });

/**
 * User login validation schema
 *
 * Validates login credentials with flexible identifier options:
 * @property {string} [email] - User's email address (optional, valid email format)
 *   - Cannot be provided together with pseudo
 * @property {string} [pseudo] - User's profile username (optional, minimum 3 characters)
 *   - Cannot be provided together with email
 * @property {string} password - User's password (required)
 *
 * Validation rules:
 * - Either email OR pseudo must be provided, but not both
 * - At least one identifier is required for authentication
 * - Password must be non-empty
 *
 * Messages are in French (FR)
 */
export const loginSchema = z
  .object({
    email: z.email("Format de l'email invalid").optional().or(z.literal('')),
    pseudo: z
      .string()
      .min(3, 'Le pseudo doit comporter au moins 3 caractères')
      .optional()
      .or(z.literal('')),
    password: z.string('Mot de passe requis'),
  })
  .refine(data => !!data.email !== !!data.pseudo, {
    message:
      'Veuillez fournir soit une adresse mail, soit un pseudo, mais pas les deux.',
    path: ['email'],
  });
