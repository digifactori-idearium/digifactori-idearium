import { type User, Role } from '@prisma/client';
import * as z from 'zod';

import { prisma } from '@/config/client.config';
import { createProfileSchema } from '@/modules/profile/profile.validation';

// Password schemas by role
const internPasswordSchema = z
  .string()
  .min(6, 'Le mot de passe doit comporter au moins 6 caractères');

const staffPasswordSchema = z
  .string()
  .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    'Il faut au moins 1 majuscule, 1 minuscule et 1 chiffre.'
  );

const getPasswordSchema = (role: Role) =>
  role === Role.INTERN ? internPasswordSchema : staffPasswordSchema;

//  DB helpers
const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
};

const getOrgCode = async (): Promise<number | null> => {
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
 * Role-based password requirements:
 * - INTERN     → min 6 chars, no complexity enforced (children)
 * - ADMIN      → min 8 chars, 1 uppercase, 1 lowercase, 1 digit
 * - SUPERVISOR → min 8 chars, 1 uppercase, 1 lowercase, 1 digit
 *
 * Role-based code requirements:
 * - ADMIN      → must provide `admin_code` matching ADMIN_CODE env variable
 * - SUPERVISOR → must provide `org_code` matching the orgCode in Setting table
 * - INTERN     → no code required at registration
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
    password: z.string('Le mot de passe est requis'),
    admin_code: z.string().optional(),
    orgCode: z.coerce.number().optional(),
  })
  .superRefine(async (data, ctx) => {
    // Password: validate against the right schema for this role
    const passwordResult = getPasswordSchema(data.role).safeParse(
      data.password
    );
    if (!passwordResult.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: passwordResult.error.issues[0].message,
      });
      return;
    }

    // ADMIN: verify against ADMIN_CODE env variable
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

    // SUPERVISOR: verify against orgCode in Setting table
    if (data.role === Role.SUPERVISOR) {
      if (!data.orgCode) {
        ctx.addIssue({
          code: 'custom',
          path: ['orgCode'],
          message:
            'Le code organisation est requis pour créer un compte superviseur.',
        });
        return;
      }

      const orgCode = await getOrgCode();

      if (!orgCode) {
        ctx.addIssue({
          code: 'custom',
          path: ['orgCode'],
          message:
            "Aucun code organisation configuré. Contactez l'administrateur.",
        });
        return;
      }

      if (data.orgCode !== orgCode) {
        ctx.addIssue({
          code: 'custom',
          path: ['orgCode'],
          message: 'Code organisation invalide.',
        });
      }
    }
  })
  // eslint-disable-next-line unused-imports/no-unused-vars
  .transform(({ admin_code, orgCode, ...rest }) => rest);

/**
 * User profile update validation schema.
 * Parental code is not editable by the user — it is managed by the admin.
 *
 * Messages are in French (FR)
 */
export const userProfileSchema = z.object({
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
});

/**
 * Composite registration schema.
 * Combines userSchema + createProfileSchema() and checks email uniqueness.
 *
 * Messages are in French (FR)
 */
export const registrationSchema = z
  .object({
    user: userSchema,
    profile: createProfileSchema(),
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
 * Password complexity is enforced based on the user's role passed in context.
 *
 * @property {string} currentPassword - The user's current password
 * @property {string} newPassword     - Complexity depends on role
 * @property {string} confirmPassword - Must match newPassword
 * @property {Role}   role            - Injected from JWT to pick the right password rules
 *
 * Messages are in French (FR)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      error: () => 'Le mot de passe actuel est requis',
    }),
    newPassword: z.string('Le nouveau mot de passe est requis'),
    confirmPassword: z.string({ error: () => 'La confirmation est requise' }),
    role: z.enum(Role),
  })
  .superRefine((data, ctx) => {
    const passwordResult = getPasswordSchema(data.role).safeParse(
      data.newPassword
    );
    if (!passwordResult.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: passwordResult.error.issues[0].message,
      });
    }

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
 * Role is retrieved from the reset token in the controller and injected here.
 *
 * @property {string} newPassword     - Complexity depends on role
 * @property {string} confirmPassword - Must match newPassword
 * @property {Role}   role            - Injected from the reset token, not request body
 *
 * Messages are in French (FR)
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z.string('Le nouveau mot de passe est requis'),
    confirmPassword: z.string({ error: () => 'La confirmation est requise' }),
    role: z.enum(Role), // injected from the reset token in the controller
  })
  .superRefine((data, ctx) => {
    const passwordResult = getPasswordSchema(data.role).safeParse(
      data.newPassword
    );
    if (!passwordResult.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: passwordResult.error.issues[0].message,
      });
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Les mots de passe ne correspondent pas.',
      });
    }
  });
