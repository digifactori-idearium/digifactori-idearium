import { Role } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@/config/client.config';

const getPseudoExists = async (pseudo: string): Promise<boolean> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { pseudo },
      select: { id: true },
    });
    return profile !== null;
  } catch {
    return false;
  }
};

/**
 * Schema for creating a new user account (admin/supervisor flow).
 *
 * @property {string} email      - Valid email format
 * @property {string} first_name - Minimum 2 characters
 * @property {string} last_name  - Minimum 2 characters
 * @property {string} pseudo     - Minimum 2 characters, must be unique
 * @property {Role}   role       - The role to assign (enforced further in the controller)
 *
 * Messages are in French (FR)
 */
export const createUserSchema = z
  .object({
    email: z.email({
      error: iss =>
        iss.input === undefined
          ? "L'adresse mail est requise"
          : 'Adresse mail invalide',
    }),
    first_name: z
      .string()
      .min(2, "Le prénom doit être composé d'au moins 2 caractères"),
    last_name: z
      .string()
      .min(2, 'Le nom de famille doit comporter au moins 2 caractères'),
    pseudo: z.string().min(2, 'Le pseudo doit comporter au moins 2 caractères'),
    role: z.enum(Role, {
      error: iss =>
        iss.input === undefined ? 'Le rôle est requis' : 'Rôle inconnu',
    }),
  })
  .superRefine(async (data, ctx) => {
    const exists = await getPseudoExists(data.pseudo);
    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['pseudo'],
        message: 'Ce pseudo est déjà utilisé.',
      });
    }
  });

/**
 * Schema for updating a user's basic data
 *
 * @property {string} [email]      - Valid email format
 * @property {string} [first_name] - Minimum 2 characters
 * @property {string} [last_name]  - Minimum 2 characters
 *
 * Messages are in French (FR)
 */
export const updateUserSchema = z.object({
  email: z.email({ error: () => 'Adresse mail invalide' }).optional(),
  first_name: z
    .string()
    .min(2, "Le prénom doit être composé d'au moins 2 caractères")
    .optional(),
  last_name: z
    .string()
    .min(2, 'Le nom de famille doit comporter au moins 2 caractères')
    .optional(),

  role: z.enum(Role).optional(),
});

/**
 * Schema for changing a user's role.
 *
 * @property {Role} role - The new role to assign
 *
 * Messages are in French (FR)
 */
export const updateRoleSchema = z.object({
  role: z.enum(Role, {
    error: iss =>
      iss.input === undefined ? 'Le rôle est requis' : 'Rôle inconnu',
  }),
});
