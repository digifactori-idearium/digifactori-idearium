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

const userSchema = z
  .object({
    email: z.email({
      error: iss => {
        return iss.input === undefined ? 'Email is required' : 'Invalid Email';
      },
    }),
    first_name: z
      .string('First Name is required')
      .min(2, 'First Name must be at least 2 char'),
    last_name: z
      .string('Last Name is required')
      .min(2, 'Last Name must be at least 2 char'),
    role: z.enum(Role, {
      error: iss => {
        return iss.input === undefined ? 'Role is required' : 'Unknown Role';
      },
    }),
    password: z
      .string('Password Required')
      .min(8, 'To short password, make it at least 8 🙃')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
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
        message: 'Parental code is required for child accounts (min 4 digits)',
        path: ['parental_code'],
      });
    }
  });

const profileSchema = z.object({
  pseudo: z.string('Pseudo required').min(2, 'Pseudo must be at least 2 char'),
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
        message: 'Email already exists',
      });
    }
  });

export const loginSchema = z
  .object({
    email: z.email('Invalid email format').optional().or(z.literal('')),
    pseudo: z
      .string()
      .min(3, 'Pseudo must be at least 3 characters')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be 8+ characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'Need 1 upper, 1 lower, and 1 number'
      ),
  })
  .refine(data => !!data.email !== !!data.pseudo, {
    message: 'Please provide either an Email or a Pseudo, but not both.',
    path: ['email'],
  });
