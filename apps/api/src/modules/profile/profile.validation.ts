import * as z from 'zod';

import { prisma } from '@/config/client.config';

const getPseudoExists = async (
  pseudo: string,
  excludeCurrentUserID?: string
): Promise<boolean> => {
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        pseudo,
        ...(excludeCurrentUserID && {
          NOT: { userId: excludeCurrentUserID },
        }),
      },
      select: { id: true },
    });

    return profile !== null;
  } catch {
    return false;
  }
};

const getEmailExists = async (
  email: string,
  excludeCurrentUserID?: string
): Promise<boolean> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(excludeCurrentUserID && {
          NOT: { id: excludeCurrentUserID },
        }),
      },
      select: { id: true },
    });

    return user !== null;
  } catch {
    return false;
  }
};

/**
 * User profile update validation schema.
 * Parental code is managed by the admin — not editable by the user.
 *
 * @property {string} email      - Valid email format
 * @property {string} first_name - Minimum 2 characters
 * @property {string} last_name  - Minimum 2 characters
 *
 * Messages are in French (FR)
 */
export const createUserProfileSchema = (currentUserId?: string) =>
  z.object({
    email: z
      .email({
        error: iss =>
          iss.input === undefined
            ? "L'adresse mail est requise"
            : 'Adresse mail invalide',
      })
      .superRefine(async (emailValue, ctx) => {
        const exists = await getEmailExists(emailValue, currentUserId);
        if (exists) {
          ctx.addIssue({
            code: 'custom',
            message: 'Cet email est déjà utilisé.',
          });
        }
      }),
    first_name: z
      .string('Le prénom est requis')
      .min(2, "Le prénom doit être composé d'au moins 2 caractères"),
    last_name: z
      .string('Le nom de famille est requis')
      .min(2, 'Le nom de famille doit comporter au moins 2 caractères'),
  });

/**
 * Default userProfileSchema with no exclusion — use for registration and admin user creation.
 */
export const userProfileSchema = createUserProfileSchema();

/**
 * Factory that returns a profileSchema with pseudo uniqueness check.
 *
 * @param excludePseudo - The current user's pseudo to exclude from the uniqueness check.
 *                        Pass this when updating a profile so the user can keep their own pseudo.
 *                        Omit when creating a new profile (registration, admin user creation).
 *
 * Messages are in French (FR)
 */
export const createProfileSchema = (currentUser?: string) =>
  z
    .object({
      pseudo: z
        .string('Le pseudo est requis')
        .min(2, 'Le pseudo doit comporter au moins 2 caractères.'),
    })
    .superRefine(async (data, ctx) => {
      const exists = await getPseudoExists(data.pseudo, currentUser);
      if (exists) {
        ctx.addIssue({
          code: 'custom',
          path: ['pseudo'],
          message: 'Ce pseudo est déjà utilisé.',
        });
      }
    });

/**
 * Default profileSchema with no exclusion — use for registration and admin user creation.
 */
export const profileSchema = createProfileSchema();
