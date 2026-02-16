import bcrypt from 'bcrypt';

import { prisma } from '../../config/client.config';

const userTable = prisma.user;
const profileTable = prisma.profile;

export default class AuthenticationService {
  // Create Account
  static async createUser(input: UserInput) {
    const { password, parental_code, ...user } = input;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedParentalCode = await bcrypt.hash(parental_code, 10);

      const newUser = await userTable.create({
        data: {
          ...user,
          password: hashedPassword,
          parental_code: hashedParentalCode,
        },
      });

      return newUser;
    } catch (error: any) {
      throw new Error(`Error creating user: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async createProfile(input: ProfileInput, userId: string) {
    try {
      const newProfile = await profileTable.create({
        data: {
          ...input,
          userId,
        },
      });

      return newProfile;
    } catch (error: any) {
      throw new Error(`Error creating user: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async createAccount(data: RegisterInput) {
    const { password, parental_code, ...userData } = data.user;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      let hashedParentalCode: string | null = null;
      if (parental_code !== undefined && parental_code !== null) {
        hashedParentalCode = await bcrypt.hash(parental_code.toString(), 10);
      }

      const result = await prisma.$transaction(async tx => {
        const newUser = await tx.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            parental_code: hashedParentalCode,
          },
        });

        const newProfile = await tx.profile.create({
          data: {
            ...data.profile,
            userId: newUser.id,
          },
        });

        return {
          user: newUser,
          profil: newProfile,
        };
      });

      return result;
    } catch (error: any) {
      throw new Error(`Error creating account: ${error.message}`);
    }
  }

  static async loginEmail(email: string, password: string) {
    try {
      const user = await userTable.findUnique({
        where: {
          email: email,
        },
      });

      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      } else {
        return null;
      }
    } catch (error: any) {
      console.log('DB ERRORS');
      throw new Error(`Error verifying user: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async loginPseudo(pseudo: string, password: string) {
    try {
      const profile = await profileTable.findUnique({
        where: {
          pseudo,
        },
        include: {
          user: true,
        },
      });

      if (profile && (await bcrypt.compare(password, profile.user.password))) {
        return profile.user;
      } else {
        return null;
      }
    } catch (error: any) {
      console.log('DB ERRORS');
      throw new Error(`Error verifying user: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}
