import * as z from 'zod';

import { prisma, type User, Role } from '../config/client.config';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;

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

export const profileSchema = z.object({
  pseudo: z
    .string('Le pseudo est requis')
    .min(2, 'Le pseudo doit comporter au moins 2 caractères.'),
});

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

export const loginSchema = z
  .object({
    email: z.email("Format de l'email invalid").optional().or(z.literal('')),
    pseudo: z
      .string()
      .min(3, 'Le pseudo doit comporter au moins 3 caractères')
      .optional()
      .or(z.literal('')),
    password: z.string('Mot de passe requis'),
    // .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    //   'Il faut au moins 1 majuscule, 1 minuscule et 1 chiffre.'
    // ),
  })
  .refine(data => !!data.email !== !!data.pseudo, {
    message:
      'Veuillez fournir soit une adresse mail, soit un pseudo, mais pas les deux.',
    path: ['email'],
  });
