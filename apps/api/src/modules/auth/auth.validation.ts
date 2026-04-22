import { type User, Role } from '@prisma/client';
import * as z from 'zod';

import { prisma } from '@/config/client.config';

/**
 * Regex pattern for password validation
 * Requirements: at least 1 lowercase letter, 1 uppercase letter, and 1 digit
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
};

const checkHasParentalCode = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { parental_code: true },
    });
    return user?.parental_code !== null && user?.parental_code !== undefined;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Fetches the current org code from the Setting table.
 * Returns null if no setting row exists yet.
 */
const getOrgCode = async (): Promise<string | null> => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { id: 1 },
      select: { orgCode: true },
    });
    return setting?.orgCode ?? null;
  } catch {
    return null;
  }
};

/**
 * User registration validation schema
 *
 * Role-based code requirements:
 * - ADMIN      → must provide `admin_code` matching ADMIN_CODE env variable
 * - SUPERVISOR → must provide `org_code` matching the orgCode in Setting table
 * - INTERN     → must provide `parental_code` (minimum 4 digits)
 *
 * @property {string} email         - Valid email format
 * @property {string} first_name    - Minimum 2 characters
 * @property {string} last_name     - Minimum 2 characters
 * @property {Role}   role          - ADMIN | SUPERVISOR | INTERN
 * @property {string} password      - Min 6 chars, 1 uppercase, 1 lowercase, 1 digit
 * @property {string} [admin_code]  - Required if role is ADMIN
 * @property {string} [org_code]    - Required if role is SUPERVISOR
 * @property {number} [parental_code] - Required if role is INTERN (min 4 digits)
 *
 * Messages are in French (FR)
 */
export const userSchema = z
  .object({
    email: z.email({
      error: iss =>
        iss.input === undefined
          ? "L'adresse mail est requise"
          : 'Adresse mail invalide',
    }),
    first_name: z
      .string('Le prénom est requis')
      .min(2, "Le prénom doit être composé d'au moins 2 caractères"),
    last_name: z
      .string('Le nom de famille est requis')
      .min(2, 'Le nom de famille doit comporter au moins 2 caractères'),
    role: z.enum(Role, {
      error: iss =>
        iss.input === undefined ? 'Le rôle est requis' : 'Rôle inconnu',
    }),
    password: z
      .string('Le mot de passe est requis')
      .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
      .regex(
        passwordRegex,
        'Il faut au moins 1 majuscule, 1 minuscule et 1 chiffre.'
      ),
    admin_code: z.string().optional(),
    org_code: z.string().optional(),
    parental_code: z.coerce.number().optional(),
  })
  .superRefine(async (data, ctx) => {
    if (data.role === Role.ADMIN) {
      const adminCode = process.env.ADMIN_CODE;

      if (!data.admin_code) {
        ctx.addIssue({
          code: 'custom',
          path: ['admin_code'],
          message:
            'Le code administrateur est requis pour créer un compte admin.',
        });
        return;
      }

      if (data.admin_code !== adminCode) {
        ctx.addIssue({
          code: 'custom',
          path: ['admin_code'],
          message: 'Code administrateur invalide.',
        });
      }
      return;
    }

    if (data.role === Role.SUPERVISOR) {
      if (!data.org_code) {
        ctx.addIssue({
          code: 'custom',
          path: ['org_code'],
          message:
            'Le code organisation est requis pour créer un compte superviseur.',
        });
        return;
      }

      const orgCode = await getOrgCode();

      if (!orgCode) {
        ctx.addIssue({
          code: 'custom',
          path: ['org_code'],
          message:
            "Aucun code organisation configuré. Contactez l'administrateur.",
        });
        return;
      }

      if (data.org_code !== orgCode) {
        ctx.addIssue({
          code: 'custom',
          path: ['org_code'],
          message: 'Code organisation invalide.',
        });
      }
      return;
    }

    if (data.role === Role.INTERN) {
      if (!data.parental_code || data.parental_code.toString().length < 4) {
        ctx.addIssue({
          code: 'custom',
          path: ['parental_code'],
          message:
            'Un code parental est requis pour les comptes stagiaires (minimum 4 chiffres).',
        });
      }
    }
  });

/**
 * User profile update validation schema
 *
 * @property {string} email           - Valid email format
 * @property {string} first_name      - Minimum 2 characters
 * @property {string} last_name       - Minimum 2 characters
 * @property {Role}   role            - ADMIN | SUPERVISOR | INTERN
 * @property {string} [parental_code] - Required for INTERN if not already set in DB
 *
 * Messages are in French (FR)
 */
export const userProfileSchema = z
  .object({
    email: z.email({
      error: iss =>
        iss.input === undefined
          ? "L'adresse mail est requise"
          : 'Adresse mail invalide',
    }),
    first_name: z
      .string('Le prénom est requis')
      .min(2, "Le prénom doit être composé d'au moins 2 caractères"),
    last_name: z
      .string('Le nom de famille est requis')
      .min(2, 'Le nom de famille doit comporter au moins 2 caractères'),
    role: z.enum(Role, {
      error: iss =>
        iss.input === undefined ? 'Le rôle est requis' : 'Rôle inconnu',
    }),
    parental_code: z.string().optional().or(z.literal('')),
  })
  .superRefine(async (data, ctx) => {
    if (data.role !== Role.INTERN) return;

    const hasCodeInDb = await checkHasParentalCode(data.email);

    if (
      !hasCodeInDb &&
      (!data.parental_code || data.parental_code.length < 4)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['parental_code'],
        message: 'Un code parental est requis pour les comptes stagiaires.',
      });
    }
  });

/**
 * @property {string} pseudo - Minimum 2 characters, must be unique
 *
 * Messages are in French (FR)
 */
export const profileSchema = z.object({
  pseudo: z
    .string('Le pseudo est requis')
    .min(2, 'Le pseudo doit comporter au moins 2 caractères.'),
});

/**
 * Composite registration schema.
 * Combines userSchema + profileSchema and checks email uniqueness.
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
 * Validates login credentials.
 * Either email OR pseudo must be provided, but not both.
 *
 * Messages are in French (FR)
 */
export const loginSchema = z
  .object({
    email: z.email("Format de l'email invalide").optional().or(z.literal('')),
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

/**
 * Schema for changing a password while logged in.
 *
 * @property {string} currentPassword - The user's current password
 * @property {string} newPassword     - Min 6 chars, regex enforced
 * @property {string} confirmPassword - Must match newPassword
 *
 * Messages are in French (FR)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      error: () => 'Le mot de passe actuel est requis',
    }),
    newPassword: z
      .string()
      .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
      .regex(
        passwordRegex,
        'Il faut au moins 1 majuscule, 1 minuscule et 1 chiffre.'
      ),
    confirmPassword: z.string({ error: () => 'La confirmation est requise' }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Les mots de passe ne correspondent pas.',
      });
    }
    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: "Le nouveau mot de passe doit être différent de l'actuel.",
      });
    }
  });

/**
 * Schema for requesting a password reset email.
 *
 * @property {string} email - The account email to send the reset link to
 *
 * Messages are in French (FR)
 */
export const requestResetSchema = z.object({
  email: z.email({
    error: iss =>
      iss.input === undefined
        ? "L'adresse mail est requise"
        : 'Adresse mail invalide',
  }),
});

/**
 * Schema for resetting a password via email token link.
 *
 * @property {string} newPassword     - Min 6 chars, regex enforced
 * @property {string} confirmPassword - Must match newPassword
 *
 * Messages are in French (FR)
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
      .regex(
        passwordRegex,
        'Il faut au moins 1 majuscule, 1 minuscule et 1 chiffre.'
      ),
    confirmPassword: z.string({ error: () => 'La confirmation est requise' }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Les mots de passe ne correspondent pas.',
      });
    }
  });
